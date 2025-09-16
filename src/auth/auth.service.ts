import { Injectable, UnauthorizedException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private passwordService: PasswordService,
    private mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    this.logger.log(`Registration attempt for email: ${dto.email}`);

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      this.logger.warn(`Registration failed - user already exists: ${dto.email}`);
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
      this.logger.log(`Verification email sent to: ${user.email}`);
    } catch (error) {
      this.logger.error('Failed to send verification email:', error);
    }

    return { message: 'Please check your email for verification link' };
  }

  async verifyEmail(token: string): Promise<{ accessToken: string; user: any }> {
    this.logger.log(`Email verification attempt with token: ${token}`);

    try {
      const decoded = this.jwtService.verify<VerificationTokenPayload>(token);

      const user = await this.prisma.user.findUnique({
        where: { email: decoded.email },
      });

      if (!user) {
        this.logger.warn(`Email verification failed - user not found for token: ${token}`);
        throw new UnauthorizedException('Invalid token');
      }

      if (user.isEmailVerified) {
        this.logger.warn(`Email verification failed - already verified: ${user.email}`);
        throw new BadRequestException('Email already verified');
      }

      if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
        await this.prisma.user.delete({
          where: { id: user.id },
        });
        this.logger.warn(`Email verification failed - token expired: ${user.email}`);
        throw new UnauthorizedException('Verification link has expired. Please sign up again.');
      }

      if (user.emailVerificationToken !== token) {
        this.logger.warn(`Email verification failed - token mismatch for: ${user.email}`);
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

      this.logger.log(`Email verified successfully for: ${updatedUser.email}`);
      return { accessToken, user: userWithoutSensitiveData };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        this.logger.warn('Email verification failed - token expired');
        throw new UnauthorizedException('Verification token has expired');
      }
      if (error.name === 'JsonWebTokenError') {
        this.logger.warn('Email verification failed - invalid token');
        throw new UnauthorizedException('Invalid verification token');
      }
      this.logger.error('Email verification error:', error);
      throw error;
    }
  }

  async validateUser(dto: LoginDto) {
    this.logger.log(`Validate user attempt for: ${dto.email}`);

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      this.logger.warn(`Validate user failed - user not found: ${dto.email}`);
      return null;
    }

    const isPasswordValid = await this.passwordService.verifyPassword(
      dto.password,
      user.password,
    );

    if (!isPasswordValid) {
      this.logger.warn(`Validate user failed - invalid password for: ${dto.email}`);
      return null;
    }

    if (!user.isEmailVerified) {
      this.logger.warn(`Validate user failed - email not verified: ${dto.email}`);
      throw new UnauthorizedException('Please verify your email address before logging in.');
    }

    const { password, emailVerificationToken, ...result } = user;
    this.logger.log(`User validated successfully: ${dto.email}`);
    return result;
  }

  async login(dto: LoginDto): Promise<{ accessToken: string; user: any }> {
    this.logger.log(`Login attempt for email: ${dto.email}`);

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    this.logger.log(`User found: ${user ? user.email : 'NOT FOUND'}`);

    if (!user) {
      this.logger.warn(`Login failed - user not found: ${dto.email}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await this.passwordService.verifyPassword(
      dto.password,
      user.password,
    );

    this.logger.log(`Password validation result: ${isPasswordValid}`);
    this.logger.log(`Input password: ${dto.password}`);
    this.logger.log(`Stored hash: ${user.password}`);

    if (!isPasswordValid) {
      this.logger.warn(`Login failed - invalid password for: ${dto.email}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      this.logger.warn(`Login failed - email not verified: ${dto.email}`);
      throw new UnauthorizedException('Please verify your email address before logging in.');
    }

    // Generate access token
    const accessToken = this.jwtService.sign({
      email: user.email,
      sub: user.id,
    });

    this.logger.log(`Generated access token for: ${user.email}`);

    // Return user data without password
    const { password, ...userWithoutPassword } = user;

    this.logger.log(`Login successful for: ${user.email}`);
    return {
      accessToken,
      user: userWithoutPassword,
    };
  }

  async findById(id: number) {
    this.logger.log(`Find user by ID: ${id}`);

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (user) {
      const { password, emailVerificationToken, ...result } = user;
      return result;
    }

    this.logger.warn(`User not found by ID: ${id}`);
    return null;
  }

  private generateAccessToken(user: any): string {
    return this.jwtService.sign({
      email: user.email,
      sub: user.id,
    });
  }

  private generateVerificationToken(email: string): string {
    return this.jwtService.sign({ email }, { expiresIn: '15m' });
  }
}