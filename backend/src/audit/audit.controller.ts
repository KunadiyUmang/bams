import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Get immutable audit logs (Super Admin only)' })
  @ApiQuery({ name: 'entity', required: false })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'actorId', required: false })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated audit logs' })
  async findAll(
    @Query('entity') entity?: string,
    @Query('action') action?: string,
    @Query('actorId') actorId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.auditService.findAll({
      entity,
      action,
      actorId,
      dateFrom,
      dateTo,
      page,
      limit,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single audit log entry by ID' })
  @ApiResponse({ status: 200, description: 'Audit log entry' })
  async findOne(@Param('id') id: string) {
    return this.auditService.findOne(id);
  }
}
