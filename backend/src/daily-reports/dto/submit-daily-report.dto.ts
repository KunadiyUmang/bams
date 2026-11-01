import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitDailyReportDto {
  @ApiPropertyOptional({ example: '2024-03-15', description: 'Date of the report, defaults to today' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ example: 'All daily cash reconciled. No discrepancies noted.' })
  @IsOptional()
  @IsString()
  notes?: string;
}
