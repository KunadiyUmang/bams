import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BusinessesModule } from './businesses/businesses.module';
import { TransactionsModule } from './transactions/transactions.module';
import { CategoriesModule } from './categories/categories.module';
import { ReportsModule } from './reports/reports.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditModule } from './audit/audit.module';
import { UploadsModule } from './uploads/uploads.module';
import { DailyReportsModule } from './daily-reports/daily-reports.module';

@Module({
  imports: [
    // Configuration — loads .env globally
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting: 100 requests per minute per IP
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Database
    PrismaModule,

    // Business logic modules
    AuthModule,
    UsersModule,
    BusinessesModule,
    TransactionsModule,
    CategoriesModule,
    ReportsModule,
    NotificationsModule,
    AuditModule,
    UploadsModule,
    DailyReportsModule,
  ],
})
export class AppModule {}
