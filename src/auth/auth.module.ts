import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { MailModule } from '../mail/mail.module';
import { JwtModule } from '@nestjs/jwt';
import { PasswordService } from './password.service';

@Module({
  imports: [PrismaModule, MailModule , JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    }),],
  providers: [AuthService, PasswordService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}