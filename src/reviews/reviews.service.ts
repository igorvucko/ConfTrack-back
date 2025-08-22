import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}


  async createReview(dto: CreateReviewDto) {
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
        userId: dto.userId,
      },
    });
  }


  async getReviewsByFestival(festivalId: number) {
    return this.prisma.review.findMany({
      where: { festivalId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}