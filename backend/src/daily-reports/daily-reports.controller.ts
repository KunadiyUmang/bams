import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DailyReportsService } from './daily-reports.service';
import { SubmitDailyReportDto } from './dto/submit-daily-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, ReportStatus } from '@prisma/client';

@ApiTags('daily-reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('daily-reports')
export class DailyReportsController {
  constructor(private readonly dailyReportsService: DailyReportsService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of daily reports' })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  @ApiQuery({ name: 'status', enum: ReportStatus, required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated daily reports' })
  async findAll(
    @CurrentUser() currentUser: any,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('status') status?: ReportStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.dailyReportsService.findAll(currentUser, {
      dateFrom,
      dateTo,
      status,
      page,
      limit,
    });
  }

  @Post('submit')
  @ApiOperation({ summary: 'Submit daily report summary' })
  @ApiResponse({ status: 201, description: 'Daily report submitted' })
  async submit(
    @Body() submitDto: SubmitDailyReportDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.dailyReportsService.submit(submitDto, currentUser);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single daily report by ID' })
  @ApiResponse({ status: 200, description: 'Daily report details' })
  async findOne(@Param('id') id: string, @CurrentUser() currentUser: any) {
    return this.dailyReportsService.findOne(id, currentUser);
  }

  @Post(':id/approve')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BUSINESS_OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve daily report (Owner/Admin only)' })
  @ApiResponse({ status: 200, description: 'Daily report approved' })
  async approve(@Param('id') id: string, @CurrentUser() currentUser: any) {
    return this.dailyReportsService.approve(id, currentUser);
  }

  @Post(':id/reject')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BUSINESS_OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject daily report with reason (Owner/Admin only)' })
  @ApiResponse({ status: 200, description: 'Daily report rejected' })
  async reject(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser() currentUser: any,
  ) {
    return this.dailyReportsService.reject(id, reason, currentUser);
  }
}
