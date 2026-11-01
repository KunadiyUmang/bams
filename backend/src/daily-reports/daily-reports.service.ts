import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { UserRole, ReportStatus, TransactionType, TransactionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { SubmitDailyReportDto } from './dto/submit-daily-report.dto';
import { calculateNetProfit } from '../common/utils/financial.utils';

@Injectable()
export class DailyReportsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async submit(
    submitDto: SubmitDailyReportDto,
    currentUser: { id: string; role: UserRole; businessId?: string; name: string },
  ) {
    if (!currentUser.businessId) {
      throw new BadRequestException('User does not belong to any business');
    }

    const reportDate = submitDto.date ? new Date(submitDto.date) : new Date();
    const startOfDay = new Date(reportDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(reportDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Sum transactions for this user & day
    const [incomeAgg, expenseAgg, investmentAgg, count] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: {
          userId: currentUser.id,
          businessId: currentUser.businessId,
          date: { gte: startOfDay, lte: endOfDay },
          type: TransactionType.INCOME,
          status: TransactionStatus.APPROVED,
        },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: {
          userId: currentUser.id,
          businessId: currentUser.businessId,
          date: { gte: startOfDay, lte: endOfDay },
          type: TransactionType.EXPENSE,
          status: TransactionStatus.APPROVED,
        },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: {
          userId: currentUser.id,
          businessId: currentUser.businessId,
          date: { gte: startOfDay, lte: endOfDay },
          type: TransactionType.INVESTMENT,
          status: TransactionStatus.APPROVED,
        },
        _sum: { amount: true },
      }),
      this.prisma.transaction.count({
        where: {
          userId: currentUser.id,
          businessId: currentUser.businessId,
          date: { gte: startOfDay, lte: endOfDay },
        },
      }),
    ]);

    const totalIncome = Number(incomeAgg._sum.amount ?? 0);
    const totalExpenses = Number(expenseAgg._sum.amount ?? 0);
    const totalInvestment = Number(investmentAgg._sum.amount ?? 0);
    const netProfit = calculateNetProfit(totalIncome, totalExpenses);

    const report = await this.prisma.dailyReport.create({
      data: {
        userId: currentUser.id,
        businessId: currentUser.businessId,
        date: startOfDay,
        totalIncome,
        totalExpenses,
        totalInvestment,
        netProfit,
        transactionCount: count,
        status: ReportStatus.SUBMITTED,
        submittedAt: new Date(),
        notes: submitDto.notes,
      },
      include: {
        user: { select: { id: true, name: true, employeeId: true } },
        business: { select: { id: true, name: true } },
      },
    });

    // Notify Business Owner
    const business = await this.prisma.business.findUnique({
      where: { id: currentUser.businessId },
      select: { ownerId: true },
    });

    if (business?.ownerId) {
      await this.notificationsService.sendNotification({
        userId: business.ownerId,
        type: 'report.submitted',
        titleEn: 'Daily Report Submitted',
        titleGu: 'દૈનિક અહેવાલ સબમિટ થયો',
        messageEn: `${currentUser.name} submitted the daily report for ${startOfDay.toLocaleDateString()}. Total income: ₹${totalIncome}, Expenses: ₹${totalExpenses}`,
        messageGu: `${currentUser.name} એ ${startOfDay.toLocaleDateString()} માટે દૈનિક અહેવાલ સબમિટ કર્યો છે. આવક: ₹${totalIncome}, ખર્ચ: ₹${totalExpenses}`,
        data: { reportId: report.id },
      });
    }

    this.notificationsGateway.emitToBusiness(
      currentUser.businessId,
      'report.submitted',
      report,
    );

    return report;
  }

  async findAll(
    currentUser: { id: string; role: UserRole; businessId?: string },
    query: { dateFrom?: string; dateTo?: string; status?: ReportStatus; page?: number; limit?: number },
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (currentUser.role === UserRole.EMPLOYEE) {
      where.userId = currentUser.id;
    } else if (currentUser.role === UserRole.BUSINESS_OWNER) {
      where.businessId = currentUser.businessId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.dateFrom || query.dateTo) {
      where.date = {};
      if (query.dateFrom) where.date.gte = new Date(query.dateFrom);
      if (query.dateTo) where.date.lte = new Date(query.dateTo);
    }

    const [data, total] = await Promise.all([
      this.prisma.dailyReport.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, employeeId: true, email: true } },
          business: { select: { id: true, name: true } },
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.dailyReport.count({ where }),
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
    const report = await this.prisma.dailyReport.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, employeeId: true, email: true } },
        business: { select: { id: true, name: true } },
      },
    });

    if (!report) {
      throw new NotFoundException(`Daily report with ID ${id} not found`);
    }

    if (
      currentUser.role === UserRole.EMPLOYEE &&
      report.userId !== currentUser.id
    ) {
      throw new ForbiddenException('Access denied to this report');
    }

    if (
      currentUser.role === UserRole.BUSINESS_OWNER &&
      report.businessId !== currentUser.businessId
    ) {
      throw new ForbiddenException('Access denied to report of another business');
    }

    return report;
  }

  async approve(id: string, currentUser: { id: string; role: UserRole; businessId?: string }) {
    if (currentUser.role === UserRole.EMPLOYEE) {
      throw new ForbiddenException('Only owners and administrators can approve daily reports');
    }

    const report = await this.findOne(id, currentUser);

    const updated = await this.prisma.dailyReport.update({
      where: { id },
      data: {
        status: ReportStatus.APPROVED,
        reviewedBy: currentUser.id,
        reviewedAt: new Date(),
        rejectionReason: null,
      },
    });

    await this.notificationsService.sendNotification({
      userId: report.userId,
      type: 'report.approved',
      titleEn: 'Daily Report Approved',
      titleGu: 'દૈનિક અહેવાલ મંજૂર થયો',
      messageEn: `Your daily report for ${new Date(report.date).toLocaleDateString()} has been approved.`,
      messageGu: `${new Date(report.date).toLocaleDateString()} માટેનો તમારો દૈનિક અહેવાલ મંજૂર કરવામાં આવ્યો છે.`,
      data: { reportId: updated.id },
    });

    return updated;
  }

  async reject(
    id: string,
    reason: string,
    currentUser: { id: string; role: UserRole; businessId?: string },
  ) {
    if (currentUser.role === UserRole.EMPLOYEE) {
      throw new ForbiddenException('Only owners and administrators can reject daily reports');
    }

    if (!reason) {
      throw new BadRequestException('A reason is required to reject a report');
    }

    const report = await this.findOne(id, currentUser);

    const updated = await this.prisma.dailyReport.update({
      where: { id },
      data: {
        status: ReportStatus.REJECTED,
        reviewedBy: currentUser.id,
        reviewedAt: new Date(),
        rejectionReason: reason,
      },
    });

    await this.notificationsService.sendNotification({
      userId: report.userId,
      type: 'report.rejected',
      titleEn: 'Daily Report Rejected',
      titleGu: 'દૈનિક અહેવાલ અસ્વીકાર થયો',
      messageEn: `Your daily report for ${new Date(report.date).toLocaleDateString()} was rejected: ${reason}`,
      messageGu: `${new Date(report.date).toLocaleDateString()} માટેનો તમારો દૈનિક અહેવાલ અસ્વીકાર થયો: ${reason}`,
      data: { reportId: updated.id, reason },
    });

    return updated;
  }
}
