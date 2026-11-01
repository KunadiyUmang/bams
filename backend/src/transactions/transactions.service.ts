import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { UserRole, TransactionType, TransactionStatus, PaymentMethod } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FilterTransactionsDto } from './dto/filter-transactions.dto';
import { calculateNetProfit, calculateBalance } from '../common/utils/financial.utils';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private notificationsService: NotificationsService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async create(
    createDto: CreateTransactionDto,
    currentUser: { id: string; role: UserRole; businessId?: string; name: string },
    ipAddress?: string,
  ) {
    // 1. Idempotency Check
    if (createDto.idempotencyKey) {
      const existing = await this.prisma.transaction.findUnique({
        where: { idempotencyKey: createDto.idempotencyKey },
        include: { user: true, business: true, categoryRel: true },
      });
      if (existing) {
        this.logger.log(`Idempotent transaction returned: ${existing.id}`);
        return existing;
      }
    }

    // 2. Resolve Business ID
    let targetBusinessId = createDto.businessId;
    if (currentUser.role === UserRole.EMPLOYEE || currentUser.role === UserRole.BUSINESS_OWNER) {
      targetBusinessId = currentUser.businessId;
    }

    if (!targetBusinessId) {
      throw new BadRequestException('A valid businessId is required for this transaction');
    }

    // 3. Resolve status based on creator role
    let initialStatus = TransactionStatus.PENDING;
    let approvedBy: string | null = null;
    let approvedAt: Date | null = null;

    if (currentUser.role === UserRole.SUPER_ADMIN || currentUser.role === UserRole.BUSINESS_OWNER) {
      initialStatus = TransactionStatus.APPROVED;
      approvedBy = currentUser.id;
      approvedAt = new Date();
    }

    // 4. Create Transaction
    const transaction = await this.prisma.transaction.create({
      data: {
        type: createDto.type,
        amount: createDto.amount,
        description: createDto.description,
        descriptionGu: createDto.descriptionGu,
        category: createDto.category,
        categoryId: createDto.categoryId,
        paymentMethod: createDto.paymentMethod,
        status: initialStatus,
        date: new Date(createDto.date),
        receiptUrl: createDto.receiptUrl,
        notes: createDto.notes,
        referenceId: createDto.referenceId,
        idempotencyKey: createDto.idempotencyKey,
        userId: currentUser.id,
        businessId: targetBusinessId,
        approvedBy,
        approvedAt,
      },
      include: {
        user: { select: { id: true, name: true, email: true, employeeId: true } },
        business: { select: { id: true, name: true, nameGu: true, currency: true } },
        categoryRel: true,
      },
    });

    // 5. Audit Log
    await this.auditService.log({
      actorId: currentUser.id,
      action: 'TRANSACTION_CREATE',
      entity: 'Transaction',
      entityId: transaction.id,
      afterData: transaction,
      ipAddress,
    });

    // 6. Emit real-time WebSocket event
    this.notificationsGateway.emitToBusiness(
      targetBusinessId,
      'transaction.created',
      transaction,
    );

    // 7. If created by employee (PENDING), notify the business owner
    if (currentUser.role === UserRole.EMPLOYEE) {
      const business = await this.prisma.business.findUnique({
        where: { id: targetBusinessId },
        select: { ownerId: true, name: true },
      });

      if (business?.ownerId) {
        await this.notificationsService.sendNotification({
          userId: business.ownerId,
          type: 'transaction.created',
          titleEn: 'New Pending Transaction',
          titleGu: 'નવી મંજૂરી માટેની વ્યવહાર',
          messageEn: `${currentUser.name} submitted a new ${transaction.type} transaction of ₹${transaction.amount} for "${transaction.category}"`,
          messageGu: `${currentUser.name} એ "${transaction.category}" માટે ₹${transaction.amount} ની નવી ${transaction.type} વ્યવહાર સબમિટ કરી છે`,
          data: { transactionId: transaction.id, businessId: targetBusinessId },
        });
      }
    }

    return transaction;
  }

  async findAll(
    filterDto: FilterTransactionsDto,
    currentUser: { id: string; role: UserRole; businessId?: string },
  ) {
    const page = Math.max(1, Number(filterDto.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filterDto.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    // Role-based scoping
    if (currentUser.role === UserRole.EMPLOYEE) {
      where.userId = currentUser.id;
      if (currentUser.businessId) {
        where.businessId = currentUser.businessId;
      }
    } else if (currentUser.role === UserRole.BUSINESS_OWNER) {
      where.businessId = currentUser.businessId;
    } else if (currentUser.role === UserRole.SUPER_ADMIN) {
      if (filterDto.businessId) {
        where.businessId = filterDto.businessId;
      }
    }

    // Custom Filters
    if (filterDto.type) {
      where.type = filterDto.type;
    }

    if (filterDto.status) {
      where.status = filterDto.status;
    }

    if (filterDto.userId && currentUser.role !== UserRole.EMPLOYEE) {
      where.userId = filterDto.userId;
    }

    if (filterDto.categoryId) {
      where.categoryId = filterDto.categoryId;
    }

    if (filterDto.category) {
      where.category = { contains: filterDto.category, mode: 'insensitive' };
    }

    if (filterDto.paymentMethod) {
      where.paymentMethod = filterDto.paymentMethod;
    }

    if (filterDto.dateFrom || filterDto.dateTo) {
      where.date = {};
      if (filterDto.dateFrom) {
        where.date.gte = new Date(filterDto.dateFrom);
      }
      if (filterDto.dateTo) {
        where.date.lte = new Date(filterDto.dateTo);
      }
    }

    if (filterDto.search) {
      where.OR = [
        { description: { contains: filterDto.search, mode: 'insensitive' } },
        { descriptionGu: { contains: filterDto.search, mode: 'insensitive' } },
        { referenceId: { contains: filterDto.search, mode: 'insensitive' } },
        { notes: { contains: filterDto.search, mode: 'insensitive' } },
        { category: { contains: filterDto.search, mode: 'insensitive' } },
      ];
    }

    const sortField = filterDto.sortBy || 'date';
    const sortOrder = (filterDto.sortOrder || 'desc').toLowerCase();

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, employeeId: true } },
          business: { select: { id: true, name: true, nameGu: true, currency: true } },
          categoryRel: true,
        },
        orderBy: { [sortField]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, currentUser: { id: string; role: UserRole; businessId?: string }) {
    const tx = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, employeeId: true } },
        business: { select: { id: true, name: true, nameGu: true, currency: true } },
        categoryRel: true,
      },
    });

    if (!tx) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    this.checkTransactionAccess(tx, currentUser);
    return tx;
  }

  async update(
    id: string,
    updateDto: UpdateTransactionDto,
    currentUser: { id: string; role: UserRole; businessId?: string },
    ipAddress?: string,
  ) {
    const existing = await this.findOne(id, currentUser);

    // Permission rules for updating
    if (currentUser.role === UserRole.EMPLOYEE) {
      if (existing.userId !== currentUser.id) {
        throw new ForbiddenException('You can only edit transactions created by you');
      }
      if (existing.status !== TransactionStatus.PENDING) {
        throw new BadRequestException('Cannot edit transactions that have already been reviewed or approved');
      }
    }

    const data: any = { ...updateDto };

    if (updateDto.date) {
      data.date = new Date(updateDto.date);
    }

    // If amount changed, capture audit trail on transaction itself
    if (updateDto.amount && Number(updateDto.amount) !== Number(existing.amount)) {
      data.originalAmount = existing.amount;
      data.editedAt = new Date();
      data.editedBy = currentUser.id;
    }

    const updated = await this.prisma.transaction.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, name: true, email: true, employeeId: true } },
        business: { select: { id: true, name: true, nameGu: true, currency: true } },
        categoryRel: true,
      },
    });

    await this.auditService.log({
      actorId: currentUser.id,
      action: 'TRANSACTION_UPDATE',
      entity: 'Transaction',
      entityId: id,
      beforeData: existing,
      afterData: updated,
      ipAddress,
    });

    return updated;
  }

  async approve(
    id: string,
    currentUser: { id: string; role: UserRole; businessId?: string },
    ipAddress?: string,
  ) {
    if (currentUser.role === UserRole.EMPLOYEE) {
      throw new ForbiddenException('Only business owners or administrators can approve transactions');
    }

    const existing = await this.findOne(id, currentUser);

    if (existing.status === TransactionStatus.APPROVED) {
      return existing;
    }

    const updated = await this.prisma.transaction.update({
      where: { id },
      data: {
        status: TransactionStatus.APPROVED,
        approvedBy: currentUser.id,
        approvedAt: new Date(),
        rejectionReason: null,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        business: true,
      },
    });

    await this.auditService.log({
      actorId: currentUser.id,
      action: 'TRANSACTION_APPROVE',
      entity: 'Transaction',
      entityId: id,
      beforeData: existing,
      afterData: updated,
      ipAddress,
    });

    // WebSocket event
    this.notificationsGateway.emitToBusiness(existing.businessId, 'transaction.approved', updated);

    // Notify creator
    await this.notificationsService.sendNotification({
      userId: existing.userId,
      type: 'transaction.approved',
      titleEn: 'Transaction Approved',
      titleGu: 'વ્યવહાર મંજૂર કરવામાં આવ્યો',
      messageEn: `Your transaction of ₹${updated.amount} for "${updated.category}" was approved.`,
      messageGu: `"${updated.category}" માટે ₹${updated.amount} ની તમારી વ્યવહાર મંજૂર કરવામાં આવી છે.`,
      data: { transactionId: updated.id },
    });

    return updated;
  }

  async reject(
    id: string,
    reason: string,
    currentUser: { id: string; role: UserRole; businessId?: string },
    ipAddress?: string,
  ) {
    if (currentUser.role === UserRole.EMPLOYEE) {
      throw new ForbiddenException('Only business owners or administrators can reject transactions');
    }

    if (!reason || reason.trim().length === 0) {
      throw new BadRequestException('A reason is required to reject a transaction');
    }

    const existing = await this.findOne(id, currentUser);

    const updated = await this.prisma.transaction.update({
      where: { id },
      data: {
        status: TransactionStatus.REJECTED,
        rejectionReason: reason.trim(),
        approvedBy: null,
        approvedAt: null,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        business: true,
      },
    });

    await this.auditService.log({
      actorId: currentUser.id,
      action: 'TRANSACTION_REJECT',
      entity: 'Transaction',
      entityId: id,
      beforeData: existing,
      afterData: updated,
      ipAddress,
    });

    // WebSocket event
    this.notificationsGateway.emitToBusiness(existing.businessId, 'transaction.rejected', updated);

    // Notify creator
    await this.notificationsService.sendNotification({
      userId: existing.userId,
      type: 'transaction.rejected',
      titleEn: 'Transaction Rejected',
      titleGu: 'વ્યવહાર અસ્વીકાર કરવામાં આવ્યો',
      messageEn: `Your transaction of ₹${updated.amount} for "${updated.category}" was rejected. Reason: ${reason}`,
      messageGu: `"${updated.category}" માટે ₹${updated.amount} ની તમારી વ્યવહાર અસ્વીકાર કરવામાં આવી છે. કારણ: ${reason}`,
      data: { transactionId: updated.id, reason },
    });

    return updated;
  }

  async remove(
    id: string,
    currentUser: { id: string; role: UserRole; businessId?: string },
    ipAddress?: string,
  ) {
    const existing = await this.findOne(id, currentUser);

    if (currentUser.role === UserRole.EMPLOYEE) {
      if (existing.userId !== currentUser.id || existing.status !== TransactionStatus.PENDING) {
        throw new ForbiddenException('Employees can only delete their own pending transactions');
      }
    }

    const deleted = await this.prisma.transaction.delete({
      where: { id },
    });

    await this.auditService.log({
      actorId: currentUser.id,
      action: 'TRANSACTION_DELETE',
      entity: 'Transaction',
      entityId: id,
      beforeData: existing,
      ipAddress,
    });

    return { success: true, message: `Transaction ${id} deleted successfully` };
  }

  async getStats(
    currentUser: { id: string; role: UserRole; businessId?: string },
    businessId?: string,
    dateFrom?: string,
    dateTo?: string,
  ) {
    let targetBusinessId = businessId;
    if (currentUser.role === UserRole.EMPLOYEE || currentUser.role === UserRole.BUSINESS_OWNER) {
      targetBusinessId = currentUser.businessId;
    }

    const where: any = {
      status: TransactionStatus.APPROVED,
    };

    if (targetBusinessId) {
      where.businessId = targetBusinessId;
    }

    if (currentUser.role === UserRole.EMPLOYEE) {
      where.userId = currentUser.id;
    }

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    const [incomeAgg, expenseAgg, investmentAgg] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { ...where, type: TransactionType.INCOME },
        _sum: { amount: true },
        _count: { id: true },
      }),
      this.prisma.transaction.aggregate({
        where: { ...where, type: TransactionType.EXPENSE },
        _sum: { amount: true },
        _count: { id: true },
      }),
      this.prisma.transaction.aggregate({
        where: { ...where, type: TransactionType.INVESTMENT },
        _sum: { amount: true },
        _count: { id: true },
      }),
    ]);

    const totalIncome = Number(incomeAgg._sum.amount ?? 0);
    const totalExpenses = Number(expenseAgg._sum.amount ?? 0);
    const totalInvestments = Number(investmentAgg._sum.amount ?? 0);
    const netProfit = calculateNetProfit(totalIncome, totalExpenses);

    let openingBalance = 0;
    if (targetBusinessId) {
      const b = await this.prisma.business.findUnique({
        where: { id: targetBusinessId },
        select: { openingBalance: true },
      });
      if (b) openingBalance = Number(b.openingBalance);
    }

    const currentBalance = calculateBalance(openingBalance, totalIncome, totalExpenses, totalInvestments);

    return {
      totalIncome,
      totalExpenses,
      totalInvestments,
      netProfit,
      openingBalance,
      currentBalance,
      counts: {
        incomeCount: incomeAgg._count.id,
        expenseCount: expenseAgg._count.id,
        investmentCount: investmentAgg._count.id,
        totalApproved: incomeAgg._count.id + expenseAgg._count.id + investmentAgg._count.id,
      },
    };
  }

  async getDashboardData(
    currentUser: { id: string; role: UserRole; businessId?: string },
    businessId?: string,
  ) {
    const stats = await this.getStats(currentUser, businessId);

    let targetBusinessId = businessId;
    if (currentUser.role !== UserRole.SUPER_ADMIN) {
      targetBusinessId = currentUser.businessId;
    }

    const where: any = targetBusinessId ? { businessId: targetBusinessId } : {};
    if (currentUser.role === UserRole.EMPLOYEE) {
      where.userId = currentUser.id;
    }

    const [recentTransactions, pendingCount, categoryBreakdown] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, employeeId: true } },
          categoryRel: true,
        },
        orderBy: { date: 'desc' },
        take: 5,
      }),
      this.prisma.transaction.count({
        where: { ...where, status: TransactionStatus.PENDING },
      }),
      this.prisma.transaction.groupBy({
        by: ['category', 'type'],
        where: { ...where, status: TransactionStatus.APPROVED },
        _sum: { amount: true },
        _count: { id: true },
        orderBy: { _sum: { amount: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      financials: stats,
      pendingCount,
      recentTransactions,
      categoryBreakdown: categoryBreakdown.map((item) => ({
        category: item.category,
        type: item.type,
        totalAmount: Number(item._sum.amount ?? 0),
        count: item._count.id,
      })),
    };
  }

  private checkTransactionAccess(
    transaction: any,
    currentUser: { id: string; role: UserRole; businessId?: string },
  ) {
    if (currentUser.role === UserRole.SUPER_ADMIN) return;

    if (currentUser.role === UserRole.BUSINESS_OWNER) {
      if (transaction.businessId !== currentUser.businessId) {
        throw new ForbiddenException('Transaction belongs to another business');
      }
      return;
    }

    if (currentUser.role === UserRole.EMPLOYEE) {
      if (transaction.userId !== currentUser.id && transaction.businessId !== currentUser.businessId) {
        throw new ForbiddenException('Access denied to this transaction');
      }
    }
  }
}
