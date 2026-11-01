import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportsGenerator } from './reports.generator';
import { Decimal } from '@prisma/client/runtime/library';

export interface ReportQueryParams {
  format: 'pdf' | 'docx' | 'xlsx' | 'csv';
  dateFrom: string;
  dateTo: string;
  userId?: string;
  businessId?: string;
  type?: string;
  language?: 'EN' | 'GU';
}

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private generator: ReportsGenerator,
  ) {}

  async generateReport(params: ReportQueryParams, requestingUserId: string) {
    const { format, dateFrom, dateTo, userId, businessId, language = 'EN' } = params;

    if (!dateFrom || !dateTo) {
      throw new BadRequestException('dateFrom and dateTo are required');
    }

    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    to.setHours(23, 59, 59, 999);

    // Build query conditions
    const whereConditions: any = {
      date: { gte: from, lte: to },
      status: 'APPROVED',
    };

    if (businessId) {
      whereConditions.businessId = businessId;
    }
    if (userId) {
      whereConditions.userId = userId;
    }
    if (params.type) {
      whereConditions.type = params.type;
    }

    // Fetch transactions
    const transactions = await this.prisma.transaction.findMany({
      where: whereConditions,
      include: {
        user: { select: { id: true, name: true, email: true, employeeId: true } },
        business: { select: { id: true, name: true, nameGu: true, logo: true, openingBalance: true } },
      },
      orderBy: { date: 'asc' },
    });

    // Fetch business/user info
    let businessInfo: any = null;
    let userInfo: any = null;

    if (businessId) {
      businessInfo = await this.prisma.business.findUnique({
        where: { id: businessId },
        include: { owner: { select: { name: true, email: true } } },
      });
    }
    if (userId) {
      userInfo = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, employeeId: true },
      });
    }

    // Calculate financials
    const totalIncome = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalInvestment = transactions
      .filter(t => t.type === 'INVESTMENT')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const netProfit = totalIncome - totalExpenses;
    const openingBalance = businessInfo ? Number(businessInfo.openingBalance) : 0;
    const closingBalance = openingBalance + totalIncome - totalExpenses + totalInvestment;

    const reportData = {
      businessInfo,
      userInfo,
      dateFrom: from,
      dateTo: to,
      language,
      transactions: transactions.map(t => ({
        ...t,
        amount: Number(t.amount),
      })),
      summary: {
        totalIncome,
        totalExpenses,
        totalInvestment,
        netProfit,
        openingBalance,
        closingBalance,
        transactionCount: transactions.length,
      },
    };

    switch (format) {
      case 'pdf':
        return this.generator.generatePDF(reportData);
      case 'docx':
        return this.generator.generateDOCX(reportData);
      case 'xlsx':
        return this.generator.generateXLSX(reportData);
      case 'csv':
        return this.generator.generateCSV(reportData);
      default:
        throw new BadRequestException(`Unsupported format: ${format}`);
    }
  }

  async getReportSummary(params: Omit<ReportQueryParams, 'format'>, requestingUserId: string) {
    const { dateFrom, dateTo, userId, businessId, type } = params;

    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    to.setHours(23, 59, 59, 999);

    const whereConditions: any = {
      date: { gte: from, lte: to },
      status: 'APPROVED',
    };

    if (businessId) whereConditions.businessId = businessId;
    if (userId) whereConditions.userId = userId;
    if (type) whereConditions.type = type;

    const [incomeAgg, expenseAgg, investmentAgg, count] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { ...whereConditions, type: 'INCOME' },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { ...whereConditions, type: 'EXPENSE' },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { ...whereConditions, type: 'INVESTMENT' },
        _sum: { amount: true },
      }),
      this.prisma.transaction.count({ where: whereConditions }),
    ]);

    const totalIncome = Number(incomeAgg._sum.amount || 0);
    const totalExpenses = Number(expenseAgg._sum.amount || 0);
    const totalInvestment = Number(investmentAgg._sum.amount || 0);

    let openingBalance = 0;
    if (businessId) {
      const biz = await this.prisma.business.findUnique({ where: { id: businessId } });
      openingBalance = Number(biz?.openingBalance || 0);
    }

    return {
      dateFrom: from.toISOString(),
      dateTo: to.toISOString(),
      totalIncome,
      totalExpenses,
      totalInvestment,
      netProfit: totalIncome - totalExpenses,
      openingBalance,
      closingBalance: openingBalance + totalIncome - totalExpenses + totalInvestment,
      transactionCount: count,
    };
  }
}
