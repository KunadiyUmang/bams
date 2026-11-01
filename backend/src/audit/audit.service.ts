import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface LogAuditParams {
  actorId: string;
  action: string;
  entity: string;
  entityId: string;
  beforeData?: any;
  afterData?: any;
  ipAddress?: string;
}

export interface FilterAuditLogsParams {
  entity?: string;
  action?: string;
  actorId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  async log(params: LogAuditParams) {
    try {
      return await this.prisma.auditLog.create({
        data: {
          actorId: params.actorId,
          action: params.action,
          entity: params.entity,
          entityId: params.entityId,
          beforeData: params.beforeData ?? null,
          afterData: params.afterData ?? null,
          ipAddress: params.ipAddress ?? null,
        },
      });
    } catch (err: any) {
      // Catch error to not break the primary business transaction
      this.logger.error(`Failed to record audit log: ${err.message}`, err.stack);
      return null;
    }
  }

  async findAll(params: FilterAuditLogsParams) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.entity) {
      where.entity = params.entity;
    }

    if (params.action) {
      where.action = params.action;
    }

    if (params.actorId) {
      where.actorId = params.actorId;
    }

    if (params.dateFrom || params.dateTo) {
      where.createdAt = {};
      if (params.dateFrom) {
        where.createdAt.gte = new Date(params.dateFrom);
      }
      if (params.dateTo) {
        where.createdAt.lte = new Date(params.dateTo);
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          actor: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    return this.prisma.auditLog.findUnique({
      where: { id },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }
}
