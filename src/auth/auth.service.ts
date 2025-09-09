import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { PrismaService } from 'prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { PasswordService } from './password.service';

interface VerificationTokenPayload {
  email: string;
  sub: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private passwordService: PasswordService,
    private mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }


    const hashedPassword = await this.passwordService.hashPassword(dto.password);


    const emailVerificationExpires = new Date();
    emailVerificationExpires.setMinutes(emailVerificationExpires.getMinutes() + 15);


    const emailVerificationToken = this.generateVerificationToken(dto.email);


    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        isEmailVerified: false,
        emailVerificationToken,
        emailVerificationExpires,
      },
    });


    try {
      await this.mailService.sendVerificationEmail(
        user.email,
        emailVerificationToken,
        user.name || user.email
      );
    } catch (error) {
      console.error('Failed to send verification email:', error);

    }


    const { password, emailVerificationToken: _, ...result } = user;
    return { message: 'Please check your email for verification link' };
  }

  async verifyEmail(token: string): Promise<{ accessToken: string; user: any }> {
    try {

      const decoded = this.jwtService.verify<VerificationTokenPayload>(token);

      const user = await this.prisma.user.findUnique({
        where: { email: decoded.email },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }


      if (user.isEmailVerified) {
        throw new BadRequestException('Email already verified');
      }


      if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {

        await this.prisma.user.delete({
          where: { id: user.id },
        });
        throw new UnauthorizedException('Verification link has expired. Please sign up again.');
      }


      if (user.emailVerificationToken !== token) {
        throw new UnauthorizedException('Invalid verification token');
      }


      const updatedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          isEmailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpires: null,
        },
      });


      const accessToken = this.generateAccessToken(updatedUser);


      const { password, emailVerificationToken, ...userWithoutSensitiveData } = updatedUser;

      return { accessToken, user: userWithoutSensitiveData };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Verification token has expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid verification token');
      }
      throw error;
    }
  }

  async validateUser(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }


    const isPasswordValid = await this.passwordService.verifyPassword(
      dto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }


    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email address before logging in.');
    }


    const { password, emailVerificationToken, ...result } = user;
    return result;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto);
    const accessToken = this.generateAccessToken(user);
    return {
      accessToken,
      user:{
        id:user.id,
        email:user.email,
        name:user.name
      }
    }
  }

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (user) {
      const { password, emailVerificationToken, ...result } = user;
      return result;
    }

    return null;
  }

  private generateAccessToken(user: any): string {
    const payload = { email: user.email, sub: user.id };
    return this.jwtService.sign(payload);
  }

  private generateVerificationToken(email: string): string {
    const payload = { email };

    return this.jwtService.sign(payload, { expiresIn: '15m' });
  }
}