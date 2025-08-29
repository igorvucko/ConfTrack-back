import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { FestivalsModule } from './festivals/festivals.module';
import { ReviewsModule } from './reviews/reviews.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    FestivalsModule,
    ReviewsModule,
    MailModule,
  ],
})
export class AppModule {}