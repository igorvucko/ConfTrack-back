import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateFestivalDto } from './dto/create-festival.dto'
import { UpdateFestivalDto } from './dto/update-festival.dto'

@Injectable()
export class FestivalsService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateFestivalDto) {
    return this.prisma.festival.create({ data })
  }

  findAll() {
    return this.prisma.festival.findMany()
  }

  findOne(id: number) {
    return this.prisma.festival.findUnique({ where: { id } })
  }

  async update(id: number, data: UpdateFestivalDto) {
    const festival = await this.prisma.festival.findUnique({ where: { id } })
    if (!festival) throw new NotFoundException('Festival not found')

    return this.prisma.festival.update({
      where: { id },
      data,
    })
  }

  async remove(id: number) {
    const festival = await this.prisma.festival.findUnique({ where: { id } })
    if (!festival) throw new NotFoundException('Festival not found')

    return this.prisma.festival.delete({ where: { id } })
  }
}