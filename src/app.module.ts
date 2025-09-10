import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ConferencesModule } from './conference/conference.module';
import { ReviewsModule } from './reviews/reviews.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    ConferencesModule,
    ReviewsModule,
    MailModule,
  ],
})
export class AppModule {}