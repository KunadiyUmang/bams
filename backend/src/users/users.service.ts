import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(currentUser: { id: string; role: UserRole; businessId?: string }) {
    if (currentUser.role === UserRole.SUPER_ADMIN) {
      return this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          employeeId: true,
          phone: true,
          profilePhoto: true,
          languagePref: true,
          isActive: true,
          businessId: true,
          business: {
            select: { id: true, name: true, nameGu: true },
          },
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (currentUser.role === UserRole.BUSINESS_OWNER) {
      // Find business owned by or associated with owner
      const businessId = currentUser.businessId;
      if (!businessId) {
        return [];
      }

      return this.prisma.user.findMany({
        where: { businessId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          employeeId: true,
          phone: true,
          profilePhoto: true,
          languagePref: true,
          isActive: true,
          businessId: true,
          business: {
            select: { id: true, name: true, nameGu: true },
          },
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    // Employee can only see their own profile in list
    return this.prisma.user.findMany({
      where: { id: currentUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        employeeId: true,
        phone: true,
        profilePhoto: true,
        languagePref: true,
        isActive: true,
        businessId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string, currentUser?: { id: string; role: UserRole; businessId?: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        business: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (currentUser) {
      if (
        currentUser.role !== UserRole.SUPER_ADMIN &&
        currentUser.id !== user.id &&
        (!currentUser.businessId || currentUser.businessId !== user.businessId)
      ) {
        throw new ForbiddenException('You do not have permission to view this user');
      }
    }

    const { passwordHash, ...result } = user;
    return result;
  }

  async create(createUserDto: CreateUserDto, currentUser: { id: string; role: UserRole; businessId?: string }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: createUserDto.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    let assignedBusinessId = createUserDto.businessId;
    let assignedRole = createUserDto.role || UserRole.EMPLOYEE;

    if (currentUser.role === UserRole.BUSINESS_OWNER) {
      // Owner can only create employees for their own business
      assignedBusinessId = currentUser.businessId;
      assignedRole = UserRole.EMPLOYEE;
    } else if (currentUser.role === UserRole.SUPER_ADMIN) {
      assignedBusinessId = createUserDto.businessId || undefined;
      assignedRole = createUserDto.role || UserRole.EMPLOYEE;
    } else {
      throw new ForbiddenException('Only administrators and business owners can create users');
    }

    let employeeId = createUserDto.employeeId;
    if (!employeeId && assignedRole === UserRole.EMPLOYEE) {
      employeeId = await this.generateEmployeeId(assignedBusinessId);
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email.toLowerCase().trim(),
        passwordHash,
        name: createUserDto.name,
        role: assignedRole,
        employeeId,
        phone: createUserDto.phone,
        profilePhoto: createUserDto.profilePhoto,
        languagePref: createUserDto.languagePref || 'EN',
        isActive: true,
        businessId: assignedBusinessId,
      },
      include: {
        business: true,
      },
    });

    const { passwordHash: _, ...result } = user;
    return result;
  }

  async update(id: string, updateUserDto: UpdateUserDto, currentUser: { id: string; role: UserRole; businessId?: string }) {
    const targetUser = await this.prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Permission check
    if (currentUser.role === UserRole.EMPLOYEE && currentUser.id !== id) {
      throw new ForbiddenException('Employees can only update their own profile');
    }

    if (
      currentUser.role === UserRole.BUSINESS_OWNER &&
      targetUser.businessId !== currentUser.businessId
    ) {
      throw new ForbiddenException('Business owners can only update users within their business');
    }

    const data: any = { ...updateUserDto };

    // Disallow employee changing their role or business
    if (currentUser.role === UserRole.EMPLOYEE) {
      delete data.role;
      delete data.businessId;
      delete data.isActive;
    }

    if (updateUserDto.password) {
      data.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
      delete data.password;
    }

    if (updateUserDto.email) {
      data.email = updateUserDto.email.toLowerCase().trim();
      const existing = await this.prisma.user.findFirst({
        where: { email: data.email, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException('Email is already taken by another account');
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data,
      include: { business: true },
    });

    const { passwordHash, ...result } = updated;
    return result;
  }

  async remove(id: string, currentUser: { id: string; role: UserRole; businessId?: string }) {
    await this.findOne(id, currentUser);

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: `User ${id} has been deactivated successfully` };
  }

  async toggleActive(id: string, currentUser: { id: string; role: UserRole; businessId?: string }) {
    const user = await this.findOne(id, currentUser);

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });

    return {
      id: updated.id,
      isActive: updated.isActive,
      message: `User status changed to ${updated.isActive ? 'Active' : 'Inactive'}`,
    };
  }

  private async generateEmployeeId(businessId?: string): Promise<string> {
    const count = await this.prisma.user.count({
      where: {
        role: UserRole.EMPLOYEE,
        ...(businessId ? { businessId } : {}),
      },
    });

    const nextNumber = count + 1;
    const padded = String(nextNumber).padStart(3, '0');
    let candidate = `EMP${padded}`;

    // Verify uniqueness
    const exists = await this.prisma.user.findUnique({
      where: { employeeId: candidate },
    });

    if (exists) {
      candidate = `EMP${Date.now().toString().slice(-4)}`;
    }

    return candidate;
  }
}
