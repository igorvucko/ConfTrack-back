
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.sevice';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  // Kreiranje nove recenzije
  async createReview(dto: CreateReviewDto, userId: number) {
    const festival = await this.prisma.festival.findUnique({
      where: { id: dto.festivalId },
    });

    if (!festival) {
      throw new NotFoundException('Festival not found');
    }

    return this.prisma.review.create({
      data: {
        rating: dto.rating,
        content: dto.content,
        festivalId: dto.festivalId,
        userId: userId,
      },
    });
  }

  // Dohvat recenzija za festival
  async getReviewsByFestival(festivalId: number) {
    return this.prisma.review.findMany({
      where: { festivalId },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}