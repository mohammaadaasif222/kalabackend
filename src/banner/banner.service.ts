import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateBannerDto, UpdateBannerDto, BannerType } from './banner.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BannerService {
  constructor(private prisma: PrismaService) {}

  async create(createBannerDto: CreateBannerDto) {
    return this.prisma.banner.create({
      data: createBannerDto,
    });
  }

  async findAll(type?: BannerType) {
    return this.prisma.banner.findMany({
      where: type ? { type } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const banner = await this.prisma.banner.findUnique({
      where: { id },
    });

    if (!banner) {
      throw new NotFoundException(`Banner with ID ${id} not found`);
    }

    return banner;
  }

  async update(id: string, updateBannerDto: UpdateBannerDto) {
    await this.findOne(id); // Check if exists

    return this.prisma.banner.update({
      where: { id },
      data: updateBannerDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if exists

    return this.prisma.banner.delete({
      where: { id },
    });
  }
}
