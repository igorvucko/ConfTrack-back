import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(createReviewDto: CreateReviewDto, userId: number) {
    return this.prisma.review.create({
      data: {
        ...createReviewDto,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        conference: true,
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        likes: true,
      },
    });
  }

  async findAll() {
    return this.prisma.review.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        conference: true,
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        likes: true,
      },
    });
  }

  async findOne(id: number) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        conference: true,
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        likes: true,
      },
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    return review;
  }

  async update(id: number, updateReviewDto: UpdateReviewDto, userId: number) {
    const review = await this.findOne(id);

    if (review.userId !== userId) {
      throw new NotFoundException('You can only update your own reviews');
    }

    return this.prisma.review.update({
      where: { id },
      data: updateReviewDto,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        conference: true,
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        likes: true,
      },
    });
  }

  async remove(id: number, userId: number) {
    const review = await this.findOne(id);

    if (review.userId !== userId) {
      throw new NotFoundException('You can only delete your own reviews');
    }

    return this.prisma.review.delete({
      where: { id },
    });
  }

     async likeReview(reviewId: number, userId: number) {

    const existingLike = await this.prisma.like.findFirst({
      where: {
        reviewId,
        userId,
      },
    });

    if (existingLike) {

      await this.prisma.like.delete({
        where: { id: existingLike.id },
      });
      return { liked: false };
    }


    await this.prisma.like.create({
      data: {
        reviewId,
        userId,

      },
    });

    return { liked: true };
  }

   async commentOnReview(reviewId: number, userId: number, content: string) {

    return this.prisma.comment.create({
      data: {
        content,
        reviewId,
        authorId: userId,

      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }
}