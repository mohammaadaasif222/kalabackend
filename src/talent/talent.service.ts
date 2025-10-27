import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TalentType, ExperienceLevel, AvailabilityStatus } from '@prisma/client';
import { CreateTalentDto, TalentFilterDto, UpdateTalentDto } from './dto/talent.dto';



@Injectable()
export class TalentService {
  constructor(private prisma: PrismaService) { }

  async create(data: CreateTalentDto) {
    return await this.prisma.talentProfile.create({
      data: {
        ...data,
        currency: data.currency || 'INR',
        verify_badge: false,
        availability_status: data.availability_status || 'available'
      },
      include: {
        socialAccounts: true
      }
    });
  }

  async findByUserId(userId: string) {
    const talent = await this.prisma.talentProfile.findUnique({
      where: { user_id: userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            user_type: true
          }
        },
        socialAccounts: {
          orderBy: [
            { is_primary: 'desc' },
            { followers_count: 'desc' }
          ]
        }
      }
    });

    if (!talent) {
      throw new NotFoundException('Talent profile not found');
    }

    return talent;
  }

  async findAll(filters?: TalentFilterDto) {
    const where: any = {};

    if (filters?.talent_type) {
      where.talent_type = filters.talent_type;
    }
    if (filters?.experience_level) {
      where.experience_level = filters.experience_level;
    }
    if (filters?.availability_status) {
      where.availability_status = filters.availability_status;
    }

    if (filters?.min_rate || filters?.max_rate) {
      where.OR = [
        {
          rate_per_hour: {
            ...(filters.min_rate && { gte: filters.min_rate }),
            ...(filters.max_rate && { lte: filters.max_rate })
          }
        },
        {
          rate_per_project: {
            ...(filters.min_rate && { gte: filters.min_rate }),
            ...(filters.max_rate && { lte: filters.max_rate })
          }
        }
      ];
    }

    return await this.prisma.talentProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        },
        socialAccounts: {
          where: { is_primary: true }
        }
      }
    });
  }

  async update(userId: string, data: UpdateTalentDto) {
    return await this.prisma.talentProfile.update({
      where: { user_id: userId },
      data,
      include: {
        socialAccounts: true
      }
    });
  }

  async remove(userId: string) {
    return await this.prisma.talentProfile.delete({
      where: { user_id: userId }
    });
  }

  async updateAvailability(userId: string, status: AvailabilityStatus) {
    return await this.prisma.talentProfile.update({
      where: { user_id: userId },
      data: { availability_status: status }
    });
  }
}