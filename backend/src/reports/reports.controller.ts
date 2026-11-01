import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiBearerAuth, ApiQuery, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReportsService, ReportQueryParams } from './reports.service';

@ApiTags('reports')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('generate')
  @ApiOperation({ summary: 'Generate and download a financial report' })
  @ApiQuery({ name: 'format', enum: ['pdf', 'docx', 'xlsx', 'csv'], required: true })
  @ApiQuery({ name: 'dateFrom', required: true, example: '2024-01-01' })
  @ApiQuery({ name: 'dateTo', required: true, example: '2024-12-31' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'businessId', required: false })
  @ApiQuery({ name: 'type', enum: ['INCOME', 'EXPENSE', 'INVESTMENT'], required: false })
  @ApiQuery({ name: 'language', enum: ['EN', 'GU'], required: false })
  async generateReport(
    @Query() query: Record<string, string>,
    @Res() res: Response,
    @Request() req: any,
  ) {
    const params: ReportQueryParams = {
      format: query.format as any,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      userId: query.userId,
      businessId: query.businessId,
      type: query.type,
      language: (query.language as any) || 'EN',
    };

    const result = await this.reportsService.generateReport(params, req.user.sub);

    const contentTypes: Record<string, string> = {
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      csv: 'text/csv',
    };

    const extensions: Record<string, string> = {
      pdf: 'pdf',
      docx: 'docx',
      xlsx: 'xlsx',
      csv: 'csv',
    };

    const fileName = `BAMS_Report_${new Date().toISOString().split('T')[0]}.${extensions[params.format]}`;

    res.set({
      'Content-Type': contentTypes[params.format],
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Access-Control-Expose-Headers': 'Content-Disposition',
    });

    res.send(result);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get financial summary for a date range (without generating file)' })
  async getReportSummary(
    @Query() query: Record<string, string>,
    @Request() req: any,
  ) {
    const params = {
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      userId: query.userId,
      businessId: query.businessId,
      type: query.type,
      language: (query.language as any) || 'EN',
    };

    const summary = await this.reportsService.getReportSummary(params, req.user.sub);
    return { success: true, data: summary };
  }
}
