import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        business: true,
      },
    });

    if (!user) {
      return null;
    }

    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) {
      return null;
    }

    const { passwordHash, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account has been deactivated. Please contact support.');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role, user.businessId);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        languagePref: user.languagePref,
        employeeId: user.employeeId,
        businessId: user.businessId,
        business: user.business,
      },
    };
  }

  async refreshTokens(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { business: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Access denied or user inactive');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role, user.businessId);
    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        languagePref: user.languagePref,
        employeeId: user.employeeId,
        businessId: user.businessId,
        business: user.business,
      },
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      // Return success even if email not found to avoid user enumeration
      return {
        message: 'If an account exists with this email, a reset OTP code has been generated.',
      };
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

    // Upsert token in database
    await this.prisma.passwordResetToken.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        token: otp,
        expiresAt,
      },
      update: {
        token: otp,
        expiresAt,
      },
    });

    // In dev mode, log OTP to console
    this.logger.log(`===============================================`);
    this.logger.log(`[AUTH] Password Reset OTP for ${user.email}: ${otp}`);
    this.logger.log(`===============================================`);

    return {
      message: 'If an account exists with this email, a reset OTP code has been generated.',
      // Provide OTP in response only if in development for easy testing
      otp: process.env.NODE_ENV === 'development' ? otp : undefined,
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email, otp, newPassword } = resetPasswordDto;

    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { passwordResetToken: true },
    });

    if (!user || !user.passwordResetToken) {
      throw new BadRequestException('Invalid or expired password reset request');
    }

    if (user.passwordResetToken.token !== otp) {
      throw new BadRequestException('Invalid OTP code');
    }

    if (new Date() > user.passwordResetToken.expiresAt) {
      await this.prisma.passwordResetToken.delete({ where: { userId: user.id } });
      throw new BadRequestException('OTP code has expired. Please request a new one.');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password and clean up reset token
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.delete({
        where: { userId: user.id },
      }),
    ]);

    return {
      message: 'Password has been reset successfully. You can now login with your new password.',
    };
  }

  async generateTokens(userId: string, email: string, role: string, businessId?: string | null) {
    const payload = { sub: userId, email, role, businessId };

    const jwtSecret = this.configService.get<string>('JWT_SECRET') || 'bams-dev-jwt-secret-2024-change-in-production';
    const jwtExpiresIn = this.configService.get<string>('JWT_EXPIRES_IN') || '15m';

    const jwtRefreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET') || 'bams-dev-refresh-secret-2024';
    const jwtRefreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: jwtSecret,
        expiresIn: jwtExpiresIn,
      }),
      this.jwtService.signAsync(payload, {
        secret: jwtRefreshSecret,
        expiresIn: jwtRefreshExpiresIn,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        business: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { passwordHash, ...result } = user;
    return result;
  }
}
