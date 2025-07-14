import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { PrismaModule } from "./prisma/prisma.module";
import { FestivalsModule } from './festivals/festivals.module';

@Module({
    imports:[AuthModule,PrismaModule, FestivalsModule]
})
export class AppModule {}