import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { FestivalsModule } from './festivals/festivals.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
    imports:[AuthModule,PrismaModule, FestivalsModule, ReviewsModule]
})
export class AppModule {}