import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { UserRole, TransactionType, TransactionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { calculateNetProfit, calculateBalance } from '../common/utils/financial.utils';

@Injectable()
export class BusinessesService {
  constructor(private prisma: PrismaService) {}

  async findAll(currentUser: { id: string; role: UserRole; businessId?: string }) {
    if (currentUser.role === UserRole.SUPER_ADMIN) {
      return this.prisma.business.findMany({
        include: {
          owner: {
            select: { id: true, name: true, email: true, phone: true },
          },
          _count: {
            select: { employees: true, transactions: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (currentUser.role === UserRole.BUSINESS_OWNER) {
      return this.prisma.business.findMany({
        where: {
          OR: [{ ownerId: currentUser.id }, { id: currentUser.businessId }],
        },
        include: {
          owner: {
            select: { id: true, name: true, email: true, phone: true },
          },
          _count: {
            select: { employees: true, transactions: true },
          },
        },
      });
    }

    if (currentUser.businessId) {
      return this.prisma.business.findMany({
        where: { id: currentUser.businessId },
        include: {
          owner: {
            select: { id: true, name: true, email: true, phone: true },
          },
          _count: {
            select: { employees: true, transactions: true },
          },
        },
      });
    }

    return [];
  }

  async findOne(id: string, currentUser: { id: string; role: UserRole; businessId?: string }) {
    this.checkBusinessAccess(id, currentUser);

    const business = await this.prisma.business.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true, phone: true },
        },
        _count: {
          select: { employees: true, transactions: true, categories: true },
        },
      },
    });

    if (!business) {
      throw new NotFoundException(`Business with ID ${id} not found`);
    }

    const stats = await this.getStats(id, currentUser);

    return {
      ...business,
      stats,
    };
  }

  async create(createBusinessDto: CreateBusinessDto) {
    const owner = await this.prisma.user.findUnique({
      where: { id: createBusinessDto.ownerId },
    });

    if (!owner) {
      throw new BadRequestException(`Owner user with ID ${createBusinessDto.ownerId} not found`);
    }

    const business = await this.prisma.$transaction(async (tx) => {
      const created = await tx.business.create({
        data: {
          name: createBusinessDto.name,
          nameGu: createBusinessDto.nameGu,
          description: createBusinessDto.description,
          phone: createBusinessDto.phone,
          email: createBusinessDto.email,
          address: createBusinessDto.address,
          openingBalance: createBusinessDto.openingBalance ?? 0,
          currency: createBusinessDto.currency ?? 'INR',
          logo: createBusinessDto.logo,
          ownerId: createBusinessDto.ownerId,
        },
      });

      // Update owner's businessId and ensure role is BUSINESS_OWNER
      await tx.user.update({
        where: { id: owner.id },
        data: {
          businessId: created.id,
          role: owner.role === UserRole.SUPER_ADMIN ? UserRole.SUPER_ADMIN : UserRole.BUSINESS_OWNER,
        },
      });

      // Seed default categories for this business
      const defaultCategories = [
        { nameEn: 'Sales', nameGu: 'વેચાણ', type: TransactionType.INCOME, isSystem: true },
        { nameEn: 'Service', nameGu: 'સેવા', type: TransactionType.INCOME, isSystem: true },
        { nameEn: 'Rent', nameGu: 'ભાડું', type: TransactionType.EXPENSE, isSystem: true },
        { nameEn: 'Utilities', nameGu: 'ઉપયોગિતા બિલ', type: TransactionType.EXPENSE, isSystem: true },
        { nameEn: 'Salaries', nameGu: 'પગાર', type: TransactionType.EXPENSE, isSystem: true },
        { nameEn: 'Office Supplies', nameGu: 'ઓફિસ સામગ્રી', type: TransactionType.EXPENSE, isSystem: true },
        { nameEn: 'Equipment', nameGu: 'સાધનસામગ્રી', type: TransactionType.INVESTMENT, isSystem: true },
      ];

      for (const cat of defaultCategories) {
        await tx.category.create({
          data: {
            ...cat,
            businessId: created.id,
          },
        });
      }

      return created;
    });

    return business;
  }

  async update(id: string, updateBusinessDto: UpdateBusinessDto, currentUser: { id: string; role: UserRole; businessId?: string }) {
    this.checkBusinessAccess(id, currentUser, true);

    const exists = await this.prisma.business.findUnique({ where: { id } });
    if (!exists) {
      throw new NotFoundException(`Business with ID ${id} not found`);
    }

    return this.prisma.business.update({
      where: { id },
      data: updateBusinessDto,
      include: {
        owner: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async toggleActive(id: string, currentUser: { id: string; role: UserRole; businessId?: string }) {
    this.checkBusinessAccess(id, currentUser, true);

    const business = await this.prisma.business.findUnique({ where: { id } });
    if (!business) {
      throw new NotFoundException(`Business with ID ${id} not found`);
    }

    return this.prisma.business.update({
      where: { id },
      data: { isActive: !business.isActive },
    });
  }

  async getStats(id: string, currentUser: { id: string; role: UserRole; businessId?: string }) {
    this.checkBusinessAccess(id, currentUser);

    const business = await this.prisma.business.findUnique({ where: { id } });
    if (!business) {
      throw new NotFoundException(`Business with ID ${id} not found`);
    }

    const [incomeAgg, expenseAgg, investmentAgg] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: {
          businessId: id,
          type: TransactionType.INCOME,
          status: TransactionStatus.APPROVED,
        },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: {
          businessId: id,
          type: TransactionType.EXPENSE,
          status: TransactionStatus.APPROVED,
        },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: {
          businessId: id,
          type: TransactionType.INVESTMENT,
          status: TransactionStatus.APPROVED,
        },
        _sum: { amount: true },
      }),
    ]);

    const totalIncome = Number(incomeAgg._sum.amount ?? 0);
    const totalExpenses = Number(expenseAgg._sum.amount ?? 0);
    const totalInvestments = Number(investmentAgg._sum.amount ?? 0);
    const openingBalance = Number(business.openingBalance);

    const netProfit = calculateNetProfit(totalIncome, totalExpenses);
    const currentBalance = calculateBalance(openingBalance, totalIncome, totalExpenses, totalInvestments);

    const [totalTransactions, pendingCount, employeeCount] = await Promise.all([
      this.prisma.transaction.count({ where: { businessId: id } }),
      this.prisma.transaction.count({ where: { businessId: id, status: TransactionStatus.PENDING } }),
      this.prisma.user.count({ where: { businessId: id, role: UserRole.EMPLOYEE, isActive: true } }),
    ]);

    return {
      openingBalance,
      totalIncome,
      totalExpenses,
      totalInvestments,
      netProfit,
      currentBalance,
      currency: business.currency,
      totalTransactions,
      pendingCount,
      employeeCount,
    };
  }

  async getEmployees(id: string, currentUser: { id: string; role: UserRole; businessId?: string }) {
    this.checkBusinessAccess(id, currentUser);

    return this.prisma.user.findMany({
      where: {
        businessId: id,
        role: UserRole.EMPLOYEE,
      },
      select: {
        id: true,
        email: true,
        name: true,
        employeeId: true,
        phone: true,
        profilePhoto: true,
        languagePref: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { employeeId: 'asc' },
    });
  }

  private checkBusinessAccess(
    businessId: string,
    currentUser: { id: string; role: UserRole; businessId?: string },
    requireWrite = false,
  ) {
    if (currentUser.role === UserRole.SUPER_ADMIN) {
      return;
    }

    if (currentUser.role === UserRole.BUSINESS_OWNER) {
      if (currentUser.businessId !== businessId) {
        throw new ForbiddenException('You can only access your own business');
      }
      return;
    }

    if (requireWrite) {
      throw new ForbiddenException('Only administrators and business owners can modify business details');
    }

    if (currentUser.businessId !== businessId) {
      throw new ForbiddenException('You do not belong to this business');
    }
  }
}
