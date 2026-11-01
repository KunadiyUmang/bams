import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BusinessesService } from './businesses.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('businesses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('businesses')
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Get()
  @ApiOperation({ summary: 'Get accessible businesses' })
  @ApiResponse({ status: 200, description: 'List of businesses' })
  async findAll(@CurrentUser() currentUser: any) {
    return this.businessesService.findAll(currentUser);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get business details and overview stats' })
  @ApiResponse({ status: 200, description: 'Business details' })
  @ApiResponse({ status: 404, description: 'Business not found' })
  async findOne(@Param('id') id: string, @CurrentUser() currentUser: any) {
    return this.businessesService.findOne(id, currentUser);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new business (Super Admin only)' })
  @ApiResponse({ status: 201, description: 'Business created' })
  async create(@Body() createBusinessDto: CreateBusinessDto) {
    return this.businessesService.create(createBusinessDto);
  }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BUSINESS_OWNER)
  @ApiOperation({ summary: 'Update business information' })
  @ApiResponse({ status: 200, description: 'Business updated' })
  async update(
    @Param('id') id: string,
    @Body() updateBusinessDto: UpdateBusinessDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.businessesService.update(id, updateBusinessDto, currentUser);
  }

  @Patch(':id/toggle-active')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BUSINESS_OWNER)
  @ApiOperation({ summary: 'Toggle business active status' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  async toggleActive(@Param('id') id: string, @CurrentUser() currentUser: any) {
    return this.businessesService.toggleActive(id, currentUser);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get full financial statistics for a business' })
  @ApiResponse({ status: 200, description: 'Business financial summary' })
  async getStats(@Param('id') id: string, @CurrentUser() currentUser: any) {
    return this.businessesService.getStats(id, currentUser);
  }

  @Get(':id/employees')
  @ApiOperation({ summary: 'Get all employees of a business' })
  @ApiResponse({ status: 200, description: 'List of business employees' })
  async getEmployees(@Param('id') id: string, @CurrentUser() currentUser: any) {
    return this.businessesService.getEmployees(id, currentUser);
  }
}
