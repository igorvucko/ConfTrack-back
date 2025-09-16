import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() dto: CreateReviewDto, @Request() req) {
    return this.reviewsService.create(dto, req.user.userId);
  }

  @Get()
  findAll(@Query('conferenceId') conferenceId?: string) {
    if (conferenceId) {
      return this.reviewsService.findByConferenceId(parseInt(conferenceId));
    }
    return this.reviewsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(+id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateReviewDto,
    @Request() req,
  ) {
    return this.reviewsService.update(+id, dto, req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.reviewsService.remove(+id, req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/like')
  likeReview(@Param('id') id: string, @Request() req) {
    return this.reviewsService.likeReview(+id, req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/comment')
  commentOnReview(
    @Param('id') id: string,
    @Body() body: { content: string },
    @Request() req,
  ) {
    return this.reviewsService.commentOnReview(
      +id,
      req.user.userId,
      body.content,
    );
  }
}