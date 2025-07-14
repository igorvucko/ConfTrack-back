import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.sevice'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10)

    const user = await this.prisma.user.create({
      data: {
email: dto.email,
        password: hashedPassword,
      },
    })

return { message: 'User created', userId: user.id }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
where: { email: dto.email },
    })

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials')
    }

const token = this.jwtService.sign({ sub: user.id, email: user.email })

    return { access_token: token }
  }
}