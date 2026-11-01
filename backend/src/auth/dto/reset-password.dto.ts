import { IsEmail, IsNotEmpty, IsString, MinLength, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: 'owner@bams.com', description: 'User email address' })
  @IsEmail({}, { message: 'Invalid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ example: '123456', description: '6-digit OTP received for password reset' })
  @IsString()
  @IsNotEmpty({ message: 'OTP token is required' })
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  otp: string;

  @ApiProperty({ example: 'NewSecret@2024', description: 'New password', minLength: 6 })
  @IsString()
  @IsNotEmpty({ message: 'New password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  newPassword: string;
}
