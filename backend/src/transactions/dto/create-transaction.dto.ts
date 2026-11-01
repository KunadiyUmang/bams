import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType, PaymentMethod } from '@prisma/client';

export class CreateTransactionDto {
  @ApiProperty({ enum: TransactionType, example: TransactionType.EXPENSE })
  @IsEnum(TransactionType, { message: 'Type must be INCOME, EXPENSE, or INVESTMENT' })
  @IsNotEmpty({ message: 'Transaction type is required' })
  type: TransactionType;

  @ApiProperty({ example: 1500.50, description: 'Transaction amount' })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Amount must be a valid number with max 2 decimals' })
  @IsPositive({ message: 'Amount must be greater than zero' })
  amount: number;

  @ApiPropertyOptional({ example: 'Purchased office stationary' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'ઓફિસ સ્ટેશનરી ખરીદી' })
  @IsOptional()
  @IsString()
  descriptionGu?: string;

  @ApiProperty({ example: 'Office Supplies', description: 'Category name' })
  @IsString()
  @IsNotEmpty({ message: 'Category is required' })
  category: string;

  @ApiPropertyOptional({ description: 'Category ID if linked' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CASH })
  @IsEnum(PaymentMethod, { message: 'Payment method must be CASH, ONLINE, BANK, CHEQUE, or UPI' })
  @IsNotEmpty({ message: 'Payment method is required' })
  paymentMethod: PaymentMethod;

  @ApiProperty({ example: '2024-03-15T10:30:00.000Z' })
  @IsDateString({}, { message: 'Date must be a valid ISO date string' })
  @IsNotEmpty({ message: 'Date is required' })
  date: string;

  @ApiPropertyOptional({ example: '/uploads/receipt-123.jpg' })
  @IsOptional()
  @IsString()
  receiptUrl?: string;

  @ApiPropertyOptional({ example: 'Voucher number #4521' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 'REF-89472' })
  @IsOptional()
  @IsString()
  referenceId?: string;

  @ApiPropertyOptional({ description: 'Unique idempotency key to prevent double posting' })
  @IsOptional()
  @IsString()
  idempotencyKey?: string;

  @ApiPropertyOptional({ description: 'Business ID (required if admin)' })
  @IsOptional()
  @IsString()
  businessId?: string;
}
