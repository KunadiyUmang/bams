import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, TransactionType } from '@prisma/client';

@ApiTags('categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List categories available to current user' })
  @ApiQuery({ name: 'type', enum: TransactionType, required: false })
  @ApiQuery({ name: 'includeInactive', type: Boolean, required: false })
  @ApiResponse({ status: 200, description: 'List of categories' })
  async findAll(
    @CurrentUser() currentUser: any,
    @Query('type') type?: TransactionType,
    @Query('includeInactive') includeInactive?: boolean,
  ) {
    return this.categoriesService.findAll(currentUser, type, includeInactive);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single category by ID' })
  @ApiResponse({ status: 200, description: 'Category details' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.BUSINESS_OWNER)
  @ApiOperation({ summary: 'Create new category' })
  @ApiResponse({ status: 201, description: 'Category created' })
  async create(@Body() createCategoryDto: CreateCategoryDto, @CurrentUser() currentUser: any) {
    return this.categoriesService.create(createCategoryDto, currentUser);
  }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BUSINESS_OWNER)
  @ApiOperation({ summary: 'Update category' })
  @ApiResponse({ status: 200, description: 'Category updated' })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.categoriesService.update(id, updateCategoryDto, currentUser);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BUSINESS_OWNER)
  @ApiOperation({ summary: 'Delete or deactivate category' })
  @ApiResponse({ status: 200, description: 'Category removed' })
  async remove(@Param('id') id: string, @CurrentUser() currentUser: any) {
    return this.categoriesService.remove(id, currentUser);
  }
}
