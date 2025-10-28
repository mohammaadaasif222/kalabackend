import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkSampleType, WorkStatus } from '@prisma/client';
import { CreateWorkSampleDto, QueryWorkSampleDto, UpdateWorkSampleDto } from './works.dto';

9570000047

@Injectable()
export class WorkService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createWorkSampleDto: CreateWorkSampleDto) {
    try {
      const talentProfile = await this.prisma.talentProfile.findUnique({
        where: { id: createWorkSampleDto.talentProfileId },
      });

      if (!talentProfile) {
        throw new NotFoundException('Talent profile not found');
      }

      const workSample = await this.prisma.workSample.create({
        data: {
          ...createWorkSampleDto,
          status: WorkStatus.pending,
        },
      });

      return workSample;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to create work sample');
    }
  }

  async findAll(queryDto?: QueryWorkSampleDto) {
    const where: any = {};

    if (queryDto?.talentProfileId) {
      where.talentProfileId = queryDto.talentProfileId;
    }

    if (queryDto?.type) {
      where.type = queryDto.type;
    }

    if (queryDto?.status) {
      where.status = queryDto.status;
    }

    return this.prisma.workSample.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const workSample = await this.prisma.workSample.findUnique({
      where: { id },
    });

    if (!workSample) {
      throw new NotFoundException(`Work sample with ID ${id} not found`);
    }

    return workSample;
  }

  async findByTalentProfile(talentProfileId: string, type?: string) {
    // Build the where clause conditionally
    const whereClause: any = { talentProfileId };
    if (type && ['video', 'image', 'reel', 'other'].includes(type)) {
      whereClause.type = type;
    }

    return this.prisma.workSample.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByType(type: WorkSampleType) {
    return this.prisma.workSample.findMany({
      where: { type },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByStatus(status: WorkStatus) {
    return this.prisma.workSample.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, updateWorkSampleDto: UpdateWorkSampleDto) {
    try {
      await this.findOne(id);

      const workSample = await this.prisma.workSample.update({
        where: { id },
        data: updateWorkSampleDto,
      });

      return workSample;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update work sample');
    }
  }

  async updateStatus(id: string, status: WorkStatus) {
    try {
      await this.findOne(id);

      return this.prisma.workSample.update({
        where: { id },
        data: { status },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update work sample status');
    }
  }

  async remove(id: string) {
    try {
      await this.findOne(id);

      await this.prisma.workSample.delete({
        where: { id },
      });

      return { message: 'Work sample deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete work sample');
    }
  }

  async removeByTalentProfile(talentProfileId: string) {
    const result = await this.prisma.workSample.deleteMany({
      where: { talentProfileId },
    });

    return {
      message: `${result.count} work sample(s) deleted successfully`,
      count: result.count,
    };
  }

  async count(queryDto?: QueryWorkSampleDto) {
    const where: any = {};

    if (queryDto?.talentProfileId) {
      where.talentProfileId = queryDto.talentProfileId;
    }

    if (queryDto?.type) {
      where.type = queryDto.type;
    }

    if (queryDto?.status) {
      where.status = queryDto.status;
    }

    return this.prisma.workSample.count({ where });
  }
}