import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordService {
  private readonly logger = new Logger(PasswordService.name);
  private readonly saltRounds = 12;

  async hashPassword(password: string): Promise<string> {
    this.logger.log('Hashing password');
    const hash = await bcrypt.hash(password, this.saltRounds);
    this.logger.log('Password hashed successfully');
    return hash;
  }

  async verifyPassword(plainTextPassword: string, hashedPassword: string): Promise<boolean> {
    this.logger.log('Verifying password');

    if (!plainTextPassword) {
      this.logger.warn('Password verification failed - no plain text password provided');
      return false;
    }

    if (!hashedPassword) {
      this.logger.warn('Password verification failed - no hashed password provided');
      return false;
    }

    try {
      const result = await bcrypt.compare(plainTextPassword, hashedPassword);
      this.logger.log(`Password verification result: ${result}`);
      return result;
    } catch (error) {
      this.logger.error('Password verification error:', error);
      return false;
    }
  }
}