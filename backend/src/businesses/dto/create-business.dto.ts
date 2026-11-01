import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsEmail,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBusinessDto {
  @ApiProperty({ example: 'Patel Enterprises', description: 'Business name in English' })
  @IsString()
  @IsNotEmpty({ message: 'Business name is required' })
  name: string;

  @ApiPropertyOptional({ example: 'પટેલ એન્ટરપ્રાઇઝ', description: 'Business name in Gujarati' })
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

  @ApiPropertyOptional({ example: 100000, default: 0 })
  @IsOptional()
  @IsNumber({}, { message: 'Opening balance must be a number' })
  @Min(0, { message: 'Opening balance cannot be negative' })
  openingBalance?: number;

  @ApiPropertyOptional({ example: 'INR', default: 'INR' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiProperty({ example: 'usr_owner123', description: 'User ID of the business owner' })
  @IsString()
  @IsNotEmpty({ message: 'Owner ID is required' })
  ownerId: string;
}
