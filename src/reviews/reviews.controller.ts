import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';


@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()

  create(@Body() createReviewDto: CreateReviewDto, @Request() req) {
    return this.reviewsService.create(createReviewDto, req.user.userId);
  }

  @Get()
  findAll() {
    return this.reviewsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(+id);
  }

  @Patch(':id')

  update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @Request() req,
  ) {
    return this.reviewsService.update(+id, updateReviewDto, req.user.userId);
  }

  @Delete(':id')

  remove(@Param('id') id: string, @Request() req) {
    return this.reviewsService.remove(+id, req.user.userId);
  }

  @Post(':id/like')

  likeReview(@Param('id') id: string, @Request() req) {
    return this.reviewsService.likeReview(+id, req.user.userId);
  }

  @Post(':id/comment')

  commentOnReview(
    @Param('id') id: string,
    @Body() body: { content: string },
    @Request() req,
  ) {
    return this.reviewsService.commentOnReview(+id, req.user.userId, body.content);
  }
}