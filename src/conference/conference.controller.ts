import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common'
import { ConferencesService } from './conference.service'
import { CreateConferenceDto } from './dto/create-conference.dto'
import { UpdateConferenceDto } from './dto/update-conference.dto'

@Controller('conferences')
export class ConferencesController {
  constructor(private readonly ConferencesService: ConferencesService) {}

  @Post()
  create(@Body() dto: CreateConferenceDto) {
    return this.ConferencesService.create(dto)
  }

  @Get()
  findAll() {
    return this.ConferencesService.findAll()
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ConferencesService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateConferenceDto) {
    return this.ConferencesService.update(id, dto)
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ConferencesService.remove(id)
  }
}