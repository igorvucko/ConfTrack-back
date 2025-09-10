import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'prisma/prisma.service'
import { CreateConferenceDto } from './dto/create-conference.dto'
import { UpdateConferenceDto } from './dto/update-conference.dto'

@Injectable()
export class ConferencesService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateConferenceDto) {
    return this.prisma.conference.create({ data })
  }

  findAll() {
    return this.prisma.conference.findMany()
  }

  findOne(id: number) {
    return this.prisma.conference.findUnique({ where: { id } })
  }

  async update(id: number, data: UpdateConferenceDto) {
    const conference = await this.prisma.conference.findUnique({ where: { id } })
    if (!conference) throw new NotFoundException('Conference not found')

    return this.prisma.conference.update({
      where: { id },
      data,
    })
  }

  async remove(id: number) {
    const conference = await this.prisma.conference.findUnique({ where: { id } })
    if (!conference) throw new NotFoundException('Conference not found')

    return this.prisma.conference.delete({ where: { id } })
  }
}