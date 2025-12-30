import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);

    constructor(
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService,
    ) { }

    async sendOtpEmail(to: string, name: string, otp: string) {
        try {
            await this.mailerService.sendMail({
                to,
                subject: 'Sport Booking - Verify your email',
                template: './otp',
                context: {
                    name,
                    otp,
                },
            });
            this.logger.log(`OTP email sent to ${to}`);
        } catch (error) {
            this.logger.error(`Failed to send OTP email to ${to}`, error.stack);
            // Don't throw error to avoid blocking registration in dev
            if (this.configService.get('app.nodeEnv') === 'development') {
                this.logger.warn(`[DEV MODE] OTP for ${to}: ${otp}`);
            }
        }
    }

    async sendResetPasswordEmail(to: string, name: string, token: string) {
        const frontendUrl = this.configService.get('app.frontendUrl');
        const resetLink = `${frontendUrl}/auth/reset-password?token=${token}`;

        try {
            await this.mailerService.sendMail({
                to,
                subject: 'Sport Booking - Reset your password',
                template: './reset-password',
                context: {
                    name,
                    resetLink,
                },
            });
            this.logger.log(`Reset password email sent to ${to}`);
        } catch (error) {
            this.logger.error(`Failed to send reset password email to ${to}`, error.stack);
            if (this.configService.get('app.nodeEnv') === 'development') {
                this.logger.warn(`[DEV MODE] Reset link for ${to}: ${resetLink}`);
            }
        }
    }
}
