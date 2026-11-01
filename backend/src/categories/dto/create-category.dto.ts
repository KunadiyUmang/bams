import { IsNotEmpty, IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Logistics', description: 'Category name in English' })
  @IsString()
  @IsNotEmpty({ message: 'Category English name is required' })
  nameEn: string;

  @ApiProperty({ example: 'પરિવહન', description: 'Category name in Gujarati' })
  @IsString()
  @IsNotEmpty({ message: 'Category Gujarati name is required' })
  nameGu: string;

  @ApiProperty({ enum: TransactionType, example: TransactionType.EXPENSE })
  @IsEnum(TransactionType, { message: 'Type must be INCOME, EXPENSE, or INVESTMENT' })
  type: TransactionType;

  @ApiPropertyOptional({ description: 'Business ID (leave empty for system-wide if admin)' })
  @IsOptional()
  @IsString()
  businessId?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;
}
