import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.sevice'
import { CreateReviewDto } from './dto/create-review.dto'

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateReviewDto) {
    const festival = await this.prisma.festival.findUnique({ where: { id: dto.festivalId } })
    if (!festival) throw new NotFoundException('Festival not found')

return this.prisma.review.create({
      data: {
        content: dto.content,
        rating: dto.rating,
        userId,
        festivalId: dto.festivalId,
      },
    })
  }

  findAll() {
return this.prisma.review.findMany({
      include: { user: true, festival: true },
    })
  }

  findByFestival(festivalId: number) {
return this.prisma.review.findMany({
      where: { festivalId },
      include: { user: true },
    })
  }
}