import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';

export interface CreateNotificationParams {
  userId: string;
  type: string;
  titleEn: string;
  titleGu: string;
  messageEn: string;
  messageGu: string;
  data?: any;
}

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private gateway: NotificationsGateway,
  ) {}

  async findAllForUser(userId: string) {
    const [notifications, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      this.prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return {
      notifications,
      unreadCount,
    };
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return { message: 'All notifications marked as read' };
  }

  async sendNotification(params: CreateNotificationParams) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        titleEn: params.titleEn,
        titleGu: params.titleGu,
        messageEn: params.messageEn,
        messageGu: params.messageGu,
        data: params.data ?? null,
      },
    });

    // Real-time emit to user room
    this.gateway.emitToUser(params.userId, params.type, notification);

    return notification;
  }

  async sendToBusiness(businessId: string, params: Omit<CreateNotificationParams, 'userId'>) {
    const users = await this.prisma.user.findMany({
      where: { businessId, isActive: true },
      select: { id: true },
    });

    const notifications = await Promise.all(
      users.map((u) =>
        this.prisma.notification.create({
          data: {
            userId: u.id,
            type: params.type,
            titleEn: params.titleEn,
            titleGu: params.titleGu,
            messageEn: params.messageEn,
            messageGu: params.messageGu,
            data: params.data ?? null,
          },
        }),
      ),
    );

    // Emit to business room
    this.gateway.emitToBusiness(businessId, params.type, {
      type: params.type,
      titleEn: params.titleEn,
      titleGu: params.titleGu,
      messageEn: params.messageEn,
      messageGu: params.messageGu,
      data: params.data,
    });

    return notifications;
  }
}
