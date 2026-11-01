import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { UserRole, TransactionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    currentUser: { id: string; role: UserRole; businessId?: string },
    type?: TransactionType,
    includeInactive = false,
  ) {
    const where: any = {};

    if (!includeInactive) {
      where.isActive = true;
    }

    if (type) {
      where.type = type;
    }

    if (currentUser.role === UserRole.SUPER_ADMIN) {
      if (currentUser.businessId) {
        where.OR = [
          { isSystem: true },
          { businessId: currentUser.businessId },
        ];
      }
      // If no businessId filter for superadmin, can see all
      return this.prisma.category.findMany({
        where,
        orderBy: [{ isSystem: 'desc' }, { nameEn: 'asc' }],
      });
    }

    // Business Owner and Employee: view system categories + their business's categories
    const businessId = currentUser.businessId;
    where.OR = [
      { isSystem: true },
      ...(businessId ? [{ businessId }] : []),
    ];

    return this.prisma.category.findMany({
      where,
      orderBy: [{ isSystem: 'desc' }, { nameEn: 'asc' }],
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { business: true },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async create(
    createCategoryDto: CreateCategoryDto,
    currentUser: { id: string; role: UserRole; businessId?: string },
  ) {
    let businessId = createCategoryDto.businessId;
    let isSystem = createCategoryDto.isSystem || false;

    if (currentUser.role !== UserRole.SUPER_ADMIN) {
      isSystem = false;
      businessId = currentUser.businessId;
      if (!businessId) {
        throw new BadRequestException('User does not belong to any business');
      }
    }

    return this.prisma.category.create({
      data: {
        nameEn: createCategoryDto.nameEn,
        nameGu: createCategoryDto.nameGu,
        type: createCategoryDto.type,
        businessId: isSystem ? null : businessId,
        isSystem,
        isActive: true,
      },
    });
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    currentUser: { id: string; role: UserRole; businessId?: string },
  ) {
    const category = await this.findOne(id);

    if (category.isSystem && currentUser.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only administrators can modify system categories');
    }

    if (
      !category.isSystem &&
      currentUser.role !== UserRole.SUPER_ADMIN &&
      category.businessId !== currentUser.businessId
    ) {
      throw new ForbiddenException('Cannot edit categories of another business');
    }

    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: string, currentUser: { id: string; role: UserRole; businessId?: string }) {
    const category = await this.findOne(id);

    if (category.isSystem && currentUser.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only administrators can delete system categories');
    }

    if (
      !category.isSystem &&
      currentUser.role !== UserRole.SUPER_ADMIN &&
      category.businessId !== currentUser.businessId
    ) {
      throw new ForbiddenException('Cannot delete categories of another business');
    }

    // Check if category has transactions attached
    const txCount = await this.prisma.transaction.count({
      where: { categoryId: id },
    });

    if (txCount > 0) {
      // Soft deactivate
      return this.prisma.category.update({
        where: { id },
        data: { isActive: false },
      });
    }

    // Hard delete if completely unused
    return this.prisma.category.delete({
      where: { id },
    });
  }
}
