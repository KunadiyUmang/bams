import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List all accessible users' })
  @ApiResponse({ status: 200, description: 'List of users' })
  async findAll(@CurrentUser() currentUser: any) {
    return this.usersService.findAll(currentUser);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single user by ID' })
  @ApiResponse({ status: 200, description: 'User details' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string, @CurrentUser() currentUser: any) {
    return this.usersService.findOne(id, currentUser);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.BUSINESS_OWNER)
  @ApiOperation({ summary: 'Create a new user/employee' })
  @ApiResponse({ status: 201, description: 'User created' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async create(@Body() createUserDto: CreateUserDto, @CurrentUser() currentUser: any) {
    return this.usersService.create(createUserDto, currentUser);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiResponse({ status: 200, description: 'User updated' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.usersService.update(id, updateUserDto, currentUser);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BUSINESS_OWNER)
  @ApiOperation({ summary: 'Soft delete / deactivate user' })
  @ApiResponse({ status: 200, description: 'User deactivated' })
  async remove(@Param('id') id: string, @CurrentUser() currentUser: any) {
    return this.usersService.remove(id, currentUser);
  }

  @Patch(':id/toggle-active')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BUSINESS_OWNER)
  @ApiOperation({ summary: 'Toggle user active/inactive status' })
  @ApiResponse({ status: 200, description: 'Status toggled' })
  async toggleActive(@Param('id') id: string, @CurrentUser() currentUser: any) {
    return this.usersService.toggleActive(id, currentUser);
  }
}
