import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common'
import { ReviewsService } from './reviews.service'
import { CreateReviewDto } from './dto/create-review.dto'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'

@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('reviews')
  create(@Request() req, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(req.user.userId, dto)
  }

  @Get('reviews')
  findAll() {
    return this.reviewsService.findAll()
  }

  @Get('festivals/:id/reviews')
  findByFestival(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.findByFestival(id)
  }
}
