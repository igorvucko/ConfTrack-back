import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');

    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not defined');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });

    this.logger.log('JWT Strategy initialized');
  }

  async validate(payload: any) {
    this.logger.log(`JWT validation for user ID: ${payload.sub}, email: ${payload.email}`);

    try {
      const user = await this.authService.findById(payload.sub);

      if (!user) {
        this.logger.warn(`JWT validation failed - user not found: ${payload.sub}`);
        throw new UnauthorizedException('User not found. Please log in again.');
      }

      this.logger.log(`JWT validation successful for: ${user.email}`);

      return {
        userId: payload.sub,
        email: payload.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified,
      };
    } catch (error) {
      this.logger.error('JWT validation error:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}