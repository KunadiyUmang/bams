import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ReportsGenerator } from './reports.generator';
import { PrismaModule } from '../prisma/prisma.module';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [PrismaModule, TransactionsModule],
  controllers: [ReportsController],
  providers: [ReportsService, ReportsGenerator],
  exports: [ReportsService],
})
export class ReportsModule {}
