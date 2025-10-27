import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Platform } from '@prisma/client';
import { CreateSocialAccountDto, UpdateSocialAccountDto } from './dto/scoial.dto';



@Injectable()
export class SocialsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateSocialAccountDto) {
    if (data.is_primary) {
      await this.prisma.talentSocialAccount.updateMany({
        where: {
          talent_profile_id: data.talent_profile_id,
          is_primary: true
        },
        data: { is_primary: false }
      });
    }

    return await this.prisma.talentSocialAccount.create({
      data: {
        ...data,
        followers_count: data.followers_count || 0,
        is_verified: data.is_verified || false,
        is_primary: data.is_primary || false
      }
    });
  }

  async findByTalentId(talentProfileId: string) {
    return await this.prisma.talentSocialAccount.findMany({
      where: { talent_profile_id: talentProfileId },
      orderBy: [
        { is_primary: 'desc' },
        { followers_count: 'desc' }
      ]
    });
  }

  async findOne(accountId: string) {
    const account = await this.prisma.talentSocialAccount.findUnique({
      where: { id: accountId }
    });

    if (!account) {
      throw new NotFoundException('Social account not found');
    }

    return account;
  }

  async update(accountId: string, data: UpdateSocialAccountDto) {
    const account = await this.findOne(accountId);

    // If setting as primary, unset other primary accounts
    if (data.is_primary) {
      await this.prisma.talentSocialAccount.updateMany({
        where: {
          talent_profile_id: account.talent_profile_id,
          is_primary: true,
          id: { not: accountId }
        },
        data: { is_primary: false }
      });
    }

    return await this.prisma.talentSocialAccount.update({
      where: { id: accountId },
      data
    });
  }

  async remove(accountId: string) {
    return await this.prisma.talentSocialAccount.delete({
      where: { id: accountId }
    });
  }

  async setPrimary(accountId: string) {
    const account = await this.findOne(accountId);

    // Unset other primary accounts
    await this.prisma.talentSocialAccount.updateMany({
      where: {
        talent_profile_id: account.talent_profile_id,
        is_primary: true
      },
      data: { is_primary: false }
    });

    // Set this account as primary
    return await this.prisma.talentSocialAccount.update({
      where: { id: accountId },
      data: { is_primary: true }
    });
  }

  async getByPlatform(talentProfileId: string, platform: Platform) {
    return await this.prisma.talentSocialAccount.findMany({
      where: {
        talent_profile_id: talentProfileId,
        platform
      }
    });
  }
}