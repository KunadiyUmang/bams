import {
  IsString,
  IsOptional,
  IsNumber,
  IsEmail,
  IsBoolean,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBusinessDto {
  @ApiPropertyOptional({ example: 'Patel Enterprises' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'પટેલ એન્ટરપ્રાઇઝ' })
  @IsOptional()
  @IsString()
  nameGu?: string;

  @ApiPropertyOptional({ example: 'Trading and General Supplies' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '+91 9825012345' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'contact@patelenterprises.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @ApiPropertyOptional({ example: 'Shop 12, Sardar Complex, Surat' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 100000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  openingBalance?: number;

  @ApiPropertyOptional({ example: 'INR' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
