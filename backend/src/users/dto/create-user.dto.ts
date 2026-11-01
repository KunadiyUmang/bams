import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, Language } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'employee@bams.com', description: 'User email' })
  @IsEmail({}, { message: 'Invalid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ example: 'Pass@123', description: 'User password', minLength: 6 })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @ApiProperty({ example: 'Ramesh Patel', description: 'Full name' })
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  name: string;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.EMPLOYEE })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be SUPER_ADMIN, BUSINESS_OWNER, or EMPLOYEE' })
  role?: UserRole;

  @ApiPropertyOptional({ example: '+91 9825012345' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'https://example.com/photo.jpg' })
  @IsOptional()
  @IsString()
  profilePhoto?: string;

  @ApiPropertyOptional({ enum: Language, default: Language.EN })
  @IsOptional()
  @IsEnum(Language, { message: 'Language preference must be EN or GU' })
  languagePref?: Language;

  @ApiPropertyOptional({ description: 'Associated Business ID (Required if not owner)' })
  @IsOptional()
  @IsString()
  businessId?: string;

  @ApiPropertyOptional({ description: 'Custom Employee ID if desired' })
  @IsOptional()
  @IsString()
  employeeId?: string;
}
