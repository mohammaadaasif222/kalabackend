import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateProfileDto, UpdateProfileDto } from './dto/profile.dto';


@Injectable()
export class ProfileService {
      constructor(private prisma: PrismaService) {}
      
  async create(data: CreateProfileDto) {
    return await this.prisma.userProfile.create({
      data: {
        ...data,
        location_country: data.location_country || 'India',
        time_zone: data.time_zone || 'Asia/Kolkata'
      }
    });
  }

  async findByUserId(userId: string) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { user_id: userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            user_type: true
          }
        }
      }
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async update(userId: string, data: UpdateProfileDto) {
    return await this.prisma.userProfile.update({
      where: { user_id: userId },
      data
    });
  }

  async remove(userId: string) {
    return await this.prisma.userProfile.delete({
      where: { user_id: userId }
    });
  }

  async search(filters: {
    city?: string;
    state?: string;
    country?: string;
    display_name?: string;
  }) {
    const where: any = {};

    if (filters.city) {
      where.location_city = { contains: filters.city, mode: 'insensitive' };
    }
    if (filters.state) {
      where.location_state = { contains: filters.state, mode: 'insensitive' };
    }
    if (filters.country) {
      where.location_country = { contains: filters.country, mode: 'insensitive' };
    }
    if (filters.display_name) {
      where.display_name = { contains: filters.display_name, mode: 'insensitive' };
    }

    return await this.prisma.userProfile.findMany({
      where,
      select: {
        id: true,
        user_id: true,
        first_name: true,
        last_name: true,
        display_name: true,
        bio: true,
        profile_image_url: true,
        location_city: true,
        location_state: true,
        location_country: true
      }
    });
  }
}
