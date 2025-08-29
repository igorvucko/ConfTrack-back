import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendVerificationEmail(email: string, token: string, name: string) {
    const verificationLink = `http://localhost:3000/verify-email?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Verify your email address',
      template: './verification',
      context: {
        name,
        verificationLink,
      },
    });
  }
}