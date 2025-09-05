import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'prisma/prisma.service'
import { CreateFestivalDto } from './dto/create-festival.dto'
import { UpdateFestivalDto } from './dto/update-festival.dto'

@Injectable()
export class FestivalsService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateFestivalDto) {
    return this.prisma.conference.create({ data })
  }

  findAll() {
    return this.prisma.conference.findMany()
  }

  findOne(id: number) {
    return this.prisma.conference.findUnique({ where: { id } })
  }

  async update(id: number, data: UpdateFestivalDto) {
    const festival = await this.prisma.conference.findUnique({ where: { id } })
    if (!festival) throw new NotFoundException('Festival not found')

    return this.prisma.conference.update({
      where: { id },
      data,
    })
  }

  async remove(id: number) {
    const festival = await this.prisma.conference.findUnique({ where: { id } })
    if (!festival) throw new NotFoundException('Festival not found')

    return this.prisma.conference.delete({ where: { id } })
  }
}