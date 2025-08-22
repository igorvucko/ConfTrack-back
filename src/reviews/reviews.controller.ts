import { Controller, Post, Body, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}


  @Post()
  create(@Body() dto: CreateReviewDto) {

    return this.reviewsService.createReview(dto);
  }


  @Get('festival/:festivalId')
  getByFestival(@Param('festivalId', ParseIntPipe) festivalId: number) {
    return this.reviewsService.getReviewsByFestival(festivalId);
  }
}