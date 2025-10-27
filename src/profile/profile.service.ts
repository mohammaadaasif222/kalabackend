import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Adjust path as needed
import type { CreateProfileDto, UpdateProfileDto } from './dto/profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createProfileDto: CreateProfileDto) {
    return this.prisma.userProfile.create({
      data: createProfileDto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            user_type: true,
          },
        },
      },
    });
  }

  async findByUserId(userId: string) {
    if (!userId) {
      throw new NotFoundException('User ID is required');
    }

    const profile = await this.prisma.userProfile.findUnique({
      where: {
        user_id: userId, // Make sure this matches your Prisma schema field name
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            user_type: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException(`Profile not found for user ID: ${userId}`);
    }

    return profile;
  }

  async search(filters: {
    city?: string;
    state?: string;
    country?: string;
    display_name?: string;
  }) {
    const where: any = {};

    if (filters.city) where.location_city = { contains: filters.city, mode: 'insensitive' };
    if (filters.state) where.location_state = { contains: filters.state, mode: 'insensitive' };
    if (filters.country) where.location_country = { contains: filters.country, mode: 'insensitive' };
    if (filters.display_name) where.display_name = { contains: filters.display_name, mode: 'insensitive' };

    return this.prisma.userProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            user_type: true,
          },
        },
      },
    });
  }

  async update(userId: string, updateProfileDto: UpdateProfileDto) {
    if (!userId) {
      throw new NotFoundException('User ID is required');
    }

    // Check if profile exists
    await this.findByUserId(userId);

    return this.prisma.userProfile.update({
      where: {
        user_id: userId,
      },
      data: updateProfileDto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            user_type: true,
          },
        },
      },
    });
  }

  async remove(userId: string) {
    if (!userId) {
      throw new NotFoundException('User ID is required');
    }

    // Check if profile exists
    await this.findByUserId(userId);

    return this.prisma.userProfile.delete({
      where: {
        user_id: userId,
      },
    });
  }
}