import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FilterTransactionsDto } from './dto/filter-transactions.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'Filter and paginate transactions' })
  @ApiResponse({ status: 200, description: 'Paginated transactions list' })
  async findAll(
    @Query() filterDto: FilterTransactionsDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.transactionsService.findAll(filterDto, currentUser);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get financial summary and KPIs for current user/business' })
  @ApiQuery({ name: 'businessId', required: false })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  @ApiResponse({ status: 200, description: 'Financial statistics' })
  async getStats(
    @CurrentUser() currentUser: any,
    @Query('businessId') businessId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.transactionsService.getStats(currentUser, businessId, dateFrom, dateTo);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard overview KPIs, recent transactions, and category breakdown' })
  @ApiQuery({ name: 'businessId', required: false })
  @ApiResponse({ status: 200, description: 'Dashboard KPI and breakdown' })
  async getDashboardData(
    @CurrentUser() currentUser: any,
    @Query('businessId') businessId?: string,
  ) {
    return this.transactionsService.getDashboardData(currentUser, businessId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single transaction details' })
  @ApiResponse({ status: 200, description: 'Transaction details' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async findOne(@Param('id') id: string, @CurrentUser() currentUser: any) {
    return this.transactionsService.findOne(id, currentUser);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created' })
  async create(
    @Body() createTransactionDto: CreateTransactionDto,
    @CurrentUser() currentUser: any,
    @Req() req: Request,
  ) {
    return this.transactionsService.create(createTransactionDto, currentUser, req.ip);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing transaction' })
  @ApiResponse({ status: 200, description: 'Transaction updated' })
  async update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @CurrentUser() currentUser: any,
    @Req() req: Request,
  ) {
    return this.transactionsService.update(id, updateTransactionDto, currentUser, req.ip);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete transaction' })
  @ApiResponse({ status: 200, description: 'Transaction deleted' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
    @Req() req: Request,
  ) {
    return this.transactionsService.remove(id, currentUser, req.ip);
  }

  @Post(':id/approve')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BUSINESS_OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve pending transaction (Owner/Admin only)' })
  @ApiResponse({ status: 200, description: 'Transaction approved' })
  async approve(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
    @Req() req: Request,
  ) {
    return this.transactionsService.approve(id, currentUser, req.ip);
  }

  @Post(':id/reject')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BUSINESS_OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject pending transaction with reason (Owner/Admin only)' })
  @ApiResponse({ status: 200, description: 'Transaction rejected' })
  async reject(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser() currentUser: any,
    @Req() req: Request,
  ) {
    return this.transactionsService.reject(id, reason, currentUser, req.ip);
  }
}
