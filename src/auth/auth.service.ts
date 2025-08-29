import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from 'prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    // Generate verification token
    // const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
       // verificationToken,
      },
    });

    // Send verification email
   // await this.mailService.sendVerificationEmail(user.email, verificationToken, user.name || user.email);

    // Remove sensitive data from response
    const { password, verificationToken: _, ...result } = user;
    return result;
  }

 // async verifyEmail(token: string) {
   // const user = await this.prisma.user.findUnique({
  //    where: { verificationToken: token },
 //   });

  //  if (!user) {
  //    throw new BadRequestException('Invalid verification token');
   // }

    // Update user to mark as verified and remove verification token
   // await this.prisma.user.update({
     // where: { id: user.id },
    //  data: {
     //   isVerified: true,
     //   verificationToken: null,
    //  },
   // });

   // return { message: 'Email verified successfully' };
  //}

  async validateUser(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is verified
    //if (!user.isVerified) {
    //  throw new UnauthorizedException('Please verify your email address before logging in');
    //}

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password, verificationToken, resetToken, resetTokenExpiry, ...result } = user;
    return result;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto);
    return user;
  }

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (user) {
      const { password, verificationToken, resetToken, resetTokenExpiry, ...result } = user;
      return result;
    }

    return null;
  }
}