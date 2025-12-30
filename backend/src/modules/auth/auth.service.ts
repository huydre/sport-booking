import {
    Injectable,
    UnauthorizedException,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { AUTH } from '../../shared/constants';
import { JwtPayload, TokenPair } from '../../shared/interfaces';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly mailService: MailService,
    ) { }

    async register(registerDto: RegisterDto) {
        const { email, password, name, phone } = registerDto;

        // Check if user exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new ConflictException('Email already registered');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, AUTH.BCRYPT_SALT_ROUNDS);

        // Generate OTP
        const otpCode = this.generateOtp();
        const otpExpiresAt = new Date(
            Date.now() + AUTH.OTP_EXPIRATION_MINUTES * 60 * 1000,
        );

        // Create user
        const user = await this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                phone,
                otpCode,
                otpExpiresAt,
            },
        });

        // Send OTP email
        await this.mailService.sendOtpEmail(email, name, otpCode);

        return {
            message: 'Registration successful. Please verify your email with OTP.',
            userId: user.id,
        };
    }

    async verifyOtp(verifyOtpDto: VerifyOtpDto) {
        const { email, otp } = verifyOtpDto;

        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        if (user.isVerified) {
            throw new BadRequestException('Email already verified');
        }

        if (!user.otpCode || !user.otpExpiresAt) {
            throw new BadRequestException('No OTP found. Please request a new one.');
        }

        if (new Date() > user.otpExpiresAt) {
            throw new BadRequestException('OTP expired. Please request a new one.');
        }

        if (user.otpCode !== otp) {
            throw new BadRequestException('Invalid OTP');
        }

        // Mark as verified
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                otpCode: null,
                otpExpiresAt: null,
            },
        });

        return { message: 'Email verified successfully' };
    }

    async login(loginDto: LoginDto): Promise<TokenPair> {
        const { email, password } = loginDto;

        const user = await this.validateUser(email, password);
        return this.generateTokens(user);
    }

    async validateUser(email: string, password: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user || !user.password) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!user.isVerified) {
            throw new UnauthorizedException('Please verify your email first');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('Account is deactivated');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return user;
    }

    async generateTokens(user: any): Promise<TokenPair> {
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        const accessToken = this.jwtService.sign(payload);

        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: 604800, // 7 days in seconds
        });

        // Save refresh token
        await this.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
        });

        return { accessToken, refreshToken };
    }

    async refreshToken(token: string): Promise<TokenPair> {
        const storedToken = await this.prisma.refreshToken.findUnique({
            where: { token },
            include: { user: true },
        });

        if (!storedToken) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        if (new Date() > storedToken.expiresAt) {
            await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });
            throw new UnauthorizedException('Refresh token expired');
        }

        // Delete old token
        await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });

        // Generate new tokens
        return this.generateTokens(storedToken.user);
    }

    async forgotPassword(email: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Don't reveal if email exists
            return { message: 'If email exists, a reset link will be sent' };
        }

        const resetToken = this.generateResetToken();
        const resetExpiresAt = new Date(
            Date.now() + AUTH.RESET_TOKEN_EXPIRATION_MINUTES * 60 * 1000,
        );

        await this.prisma.user.update({
            where: { id: user.id },
            data: { resetToken, resetExpiresAt },
        });

        // Send reset email
        await this.mailService.sendResetPasswordEmail(email, user.name, resetToken);

        return { message: 'If email exists, a reset link will be sent' };
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto) {
        const { token, newPassword } = resetPasswordDto;

        const user = await this.prisma.user.findFirst({
            where: {
                resetToken: token,
                resetExpiresAt: { gt: new Date() },
            },
        });

        if (!user) {
            throw new BadRequestException('Invalid or expired reset token');
        }

        const hashedPassword = await bcrypt.hash(
            newPassword,
            AUTH.BCRYPT_SALT_ROUNDS,
        );

        // Update password and clear reset token
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetExpiresAt: null,
            },
        });

        // Invalidate all refresh tokens
        await this.prisma.refreshToken.deleteMany({
            where: { userId: user.id },
        });

        return { message: 'Password reset successfully' };
    }

    async getProfile(userId: string) {
        return this.usersService.findById(userId);
    }

    async logout(userId: string) {
        // Delete all refresh tokens for user
        await this.prisma.refreshToken.deleteMany({
            where: { userId },
        });

        return { message: 'Logged out successfully' };
    }

    private generateOtp(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    private generateResetToken(): string {
        return require('crypto').randomBytes(32).toString('hex');
    }
}
