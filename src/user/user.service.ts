import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';

// Type definitions for our custom query results
type AdminUserResult = {
  id: string;
  email: string;
  user_type: string | null;
  is_premium: boolean;
  is_active: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  created_at: Date;
  last_login: Date | null;
  profile: {
    first_name: string | null;
    last_name: string | null;
    display_name: string | null;
    location_city: string | null;
    location_state: string | null;
  } | null;
  talentProfile: {
    talent_type: any;
    categories: any;
    availability_status: any;
    verify_badge: boolean;
    socialAccounts: Array<{
      platform: any;
      followers_count: number | null;
    }>;
  } | null;
};

type PublicTalentResult = {
  id: string;
  profile: {
    display_name: string | null;
    profile_image_url: string | null;
    bio: string | null;
    location_city: string | null;
    location_state: string | null;
  } | null;
  talentProfile: {
    talent_type: any;
    categories: any;
    specializations: any;
    verify_badge: boolean;
    experience_level: any;
    rate_per_live: any;
    rate_per_video: any;
    rate_per_post: any;
    currency: string | null;
    socialAccounts: Array<{
      platform: any;
      handle: string | null;
      profile_url: string | null;
      followers_count: number | null;
      is_verified: boolean | null;
      is_primary: boolean | null;
    }>;
  } | null;
};

type TalentProfileResult = {
  id: string;
  email: string;
  user_type: string | null;
  is_premium: boolean;
  created_at: Date;
  profile: {
    display_name: string | null;
    first_name: string | null;
    last_name: string | null;
    bio: string | null;
    profile_image_url: string | null;
    banner_image_url: string | null;
    location_city: string | null;
    location_state: string | null;
    location_country: string | null;
    website_url: string | null;
    languages: any;
    gender: string | null;
    whatsapp: string | null;
  } | null;
  talentProfile: {
    talent_type: any;
    categories: any;
    specializations: any;
    experience_level: any;
    years_of_experience: number | null;
    rate_per_live: any;
    rate_per_video: any;
    rate_per_post: any;
    currency: string | null;
    availability_status: any;
    portfolio_description: string | null;
    achievements: string | null;
    awards: any;
    certifications: any;
    collaboration_preferences: any;
    verify_badge: boolean;
    socialAccounts: Array<{
      platform: any;
      handle: string | null;
      profile_url: string | null;
      followers_count: number | null;
      engagement_rate: any;
      is_verified: boolean | null;
      is_primary: boolean | null;
    }>;
  } | null;
  reviewsReceived: Array<{
    id: string;
    rating: any;
    comment: string | null;
    created_at: Date;
    reviewer: {
      id: string;
      profile: {
        display_name: string | null;
        profile_image_url: string | null;
      } | null;
    };
  }>;
};

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }

  // Reusable select object to exclude sensitive fields
  private readonly userSelect: Prisma.UserSelect = {
    id: true,
    email: true,
    phone: true,
    user_type: true,
    google_id: true,
    is_premium: true,
    premium_expires_at: true,
    is_active: true,
    email_verified: true,
    phone_verified: true,
    created_at: true,
    updated_at: true,
    last_login: true,
    password_hash: false,
  };


  async getAdminUserList(params: {
    page: number;
    limit: number;
    search?: string;
    user_type?: string;
    talent_type?: string;
    is_premium?: boolean;
    is_active?: boolean;
    email_verified?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const {
      page = 1,
      limit = 20,
      search,
      user_type,
      talent_type,
      is_premium,
      is_active,
      email_verified,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = params;

    const skip = (page - 1) * limit;

    // Build where clause with proper typing
    const talentProfileFilter: any = {};

    if (talent_type) {
      talentProfileFilter.talent_type = talent_type;
    }

    const where: Prisma.UserWhereInput = {
      ...(is_active !== undefined && { is_active }),
      user_type: { not: 'admin' },
      ...(user_type && user_type !== 'admin' && { user_type }),
      ...(is_premium !== undefined && { is_premium }),
      ...(email_verified !== undefined && { email_verified }),
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { profile: { first_name: { contains: search, mode: 'insensitive' } } },
          { profile: { last_name: { contains: search, mode: 'insensitive' } } },
          { profile: { display_name: { contains: search, mode: 'insensitive' } } },
        ],
      }),
      ...(talent_type && { talentProfile: talentProfileFilter }),
    };

    // Build order by
    const orderBy: Prisma.UserOrderByWithRelationInput =
      sortBy === 'created_at' ? { created_at: sortOrder } :
        sortBy === 'email' ? { email: sortOrder } :
          { created_at: sortOrder };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        where,
        orderBy,
        select: {
          id: true,
          email: true,
          user_type: true,
          is_premium: true,
          is_active: true,
          email_verified: true,
          phone_verified: true,
          created_at: true,
          last_login: true,
          profile: {
            select: {
              first_name: true,
              last_name: true,
              display_name: true,
              location_city: true,
              location_state: true,
            },
          },
          talentProfile: {
            select: {
              talent_type: true,
              categories: true,
              availability_status: true,
              verify_badge: true,
              socialAccounts: {
                where: { is_primary: true },
                select: {
                  platform: true,
                  followers_count: true,
                },
                take: 1,
              },
            },
          },
        },
      }) as Promise<AdminUserResult[]>,
      this.prisma.user.count({ where }),
    ]);

    // Format response with followers count
    const formattedUsers = users.map((user) => ({
      id: user.id,
      email: user.email,
      first_name: user.profile?.first_name || '-',
      last_name: user.profile?.last_name || '-',
      display_name: user.profile?.display_name || '-',
      user_type: user.user_type || '-',
      talent_type: user.talentProfile?.talent_type || '-',
      categories: user.talentProfile?.categories || [],
      status: user.talentProfile?.availability_status || (user.is_active ? 'active' : 'inactive'),
      followers: user.talentProfile?.socialAccounts[0]?.followers_count || 0,
      is_premium: user.is_premium,
      email_verified: user.email_verified,
      phone_verified: user.phone_verified,
      verify_badge: user.talentProfile?.verify_badge || false,
      location: user.profile?.location_city && user.profile?.location_state
        ? `${user.profile.location_city}, ${user.profile.location_state}`
        : '-',
      created_at: user.created_at,
      last_login: user.last_login,
    }));

    return {
      success: true,
      data: formattedUsers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };
  }

  // async getPublicTalentList(params: {
  //   page: number;
  //   limit: number;
  //   search?: string;
  //   talent_type?: string;
  //   categories?: string;
  //   location_city?: string;
  //   min_followers?: number;
  //   verified_only?: boolean;
  //   sortBy?: 'followers' | 'created_at' | 'rating';
  //   sortOrder?: 'asc' | 'desc';
  // }) {
  //   const {
  //     page = 1,
  //     limit = 20,
  //     search,
  //     talent_type,
  //     categories,
  //     location_city,
  //     min_followers,
  //     verified_only = false,
  //     sortBy = 'created_at',
  //     sortOrder = 'desc',
  //   } = params;

  //   const skip = (page - 1) * limit;

  //   // Build where clause
  //   const talentProfileFilter: any = {
  //     isNot: null,
  //   };

  //   if (talent_type) {
  //     talentProfileFilter.talent_type = talent_type;
  //   }

  //   if (verified_only) {
  //     talentProfileFilter.verify_badge = true;
  //   }

  //   if (categories) {
  //     talentProfileFilter.categories = {
  //       array_contains: categories,
  //     };
  //   }

  //   const where: Prisma.UserWhereInput = {
  //     is_active: true,
  //     talentProfile: talentProfileFilter,
  //     ...(search && {
  //       OR: [
  //         { profile: { display_name: { contains: search, mode: 'insensitive' } } },
  //         { profile: { bio: { contains: search, mode: 'insensitive' } } },
  //       ],
  //     }),
  //     ...(location_city && {
  //       profile: { location_city: { equals: location_city, mode: 'insensitive' } },
  //     }),
  //   };

  //   // Simplified ordering
  //   const orderBy: Prisma.UserOrderByWithRelationInput = { created_at: sortOrder };

  //   const [talents, total] = await Promise.all([
  //     this.prisma.user.findMany({
  //       skip,
  //       take: limit,
  //       where,
  //       orderBy,
  //       select: {
  //         id: true,
  //         profile: {
  //           select: {
  //             display_name: true,
  //             profile_image_url: true,
  //             bio: true,
  //             location_city: true,
  //             location_state: true,
  //           },
  //         },
  //         talentProfile: {
  //           select: {
  //             talent_type: true,
  //             categories: true,
  //             specializations: true,
  //             verify_badge: true,
  //             experience_level: true,
  //             rate_per_live: true,
  //             rate_per_video: true,
  //             rate_per_post: true,
  //             currency: true,
  //             socialAccounts: {
  //               select: {
  //                 platform: true,
  //                 handle: true,
  //                 profile_url: true,
  //                 followers_count: true,
  //                 is_verified: true,
  //                 is_primary: true,
  //               },
  //               orderBy: [
  //                 { is_primary: 'desc' },
  //                 { followers_count: 'desc' },
  //               ],
  //             },
  //           },
  //         },
  //       },
  //     }) as Promise<PublicTalentResult[]>,
  //     this.prisma.user.count({ where }),
  //   ]);

  //   // Format and filter by followers if needed
  //   let formattedTalents = talents.map((talent) => {
  //     const socialAccounts = talent.talentProfile?.socialAccounts || [];
  //     const primarySocial = socialAccounts.find(s => s.is_primary);
  //     const totalFollowers = socialAccounts.reduce(
  //       (sum, acc) => sum + (acc.followers_count || 0),
  //       0
  //     );

  //     return {
  //       id: talent.id,
  //       display_name: talent.profile?.display_name || 'Anonymous',
  //       profile_image_url: talent.profile?.profile_image_url,
  //       bio: talent.profile?.bio,
  //       talent_type: talent.talentProfile?.talent_type,
  //       categories: talent.talentProfile?.categories || [],
  //       specializations: talent.talentProfile?.specializations || [],
  //       verify_badge: talent.talentProfile?.verify_badge || false,
  //       experience_level: talent.talentProfile?.experience_level,
  //       location: talent.profile?.location_city && talent.profile?.location_state
  //         ? `${talent.profile.location_city}, ${talent.profile.location_state}`
  //         : null,
  //       followers: totalFollowers,
  //       primary_platform: primarySocial?.platform,
  //       social_accounts: socialAccounts.map(acc => ({
  //         platform: acc.platform,
  //         handle: acc.handle,
  //         followers: acc.followers_count,
  //         is_verified: acc.is_verified,
  //       })),
  //       rates: {
  //         per_live: talent.talentProfile?.rate_per_live,
  //         per_video: talent.talentProfile?.rate_per_video,
  //         per_post: talent.talentProfile?.rate_per_post,
  //         currency: talent.talentProfile?.currency,
  //       },
  //     };
  //   });

  //   // Filter by minimum followers if specified
  //   if (min_followers) {
  //     formattedTalents = formattedTalents.filter(t => t.followers >= min_followers);
  //   }

  //   return {
  //     success: true,
  //     data: formattedTalents,
  //     meta: {
  //       total,
  //       page,
  //       limit,
  //       totalPages: Math.ceil(total / limit),
  //       hasMore: page * limit < total,
  //     },
  //   };
  // }


  async getPublicTalentList(params: {
    page: number;
    limit: number;
    search?: string;
    talent_type?: string;
    categories?: string;
    location_city?: string;
    min_followers?: number;
    verified_only?: boolean;
    sortBy?: 'followers' | 'created_at' | 'rating';
    sortOrder?: 'asc' | 'desc';
  }) {
    const {
      page = 1,
      limit = 20,
      search,
      talent_type,
      categories,
      location_city,
      min_followers,
      verified_only = false,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = params;

    const skip = (page - 1) * limit;

    // Build where clause
    const talentProfileFilter: any = {
      isNot: null,
    };

    if (talent_type) {
      talentProfileFilter.talent_type = talent_type;
    }

    if (verified_only) {
      talentProfileFilter.verify_badge = true;
    }

    if (categories) {
      talentProfileFilter.categories = {
        array_contains: categories,
      };
    }

    const where: Prisma.UserWhereInput = {
      is_active: true,
      user_type: {
        not: 'admin', // Exclude admin users
      },
      createdBy: {
        not: 'user', // Only get talents created by admin
      },
      talentProfile: talentProfileFilter,
      ...(search && {
        OR: [
          { profile: { display_name: { contains: search, mode: 'insensitive' } } },
          { profile: { bio: { contains: search, mode: 'insensitive' } } },
        ],
      }),
      ...(location_city && {
        profile: { location_city: { equals: location_city, mode: 'insensitive' } },
      }),
    };

    // Simplified ordering
    const orderBy: Prisma.UserOrderByWithRelationInput = { created_at: sortOrder };

    const [talents, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        where,
        orderBy,
        select: {
          id: true,
          profile: {
            select: {
              display_name: true,
              profile_image_url: true,
              bio: true,
              location_city: true,
              location_state: true,
            },
          },
          talentProfile: {
            select: {
              talent_type: true,
              categories: true,
              specializations: true,
              verify_badge: true,
              experience_level: true,
              rate_per_live: true,
              rate_per_video: true,
              rate_per_post: true,
              currency: true,
              socialAccounts: {
                select: {
                  platform: true,
                  handle: true,
                  profile_url: true,
                  followers_count: true,
                  is_verified: true,
                  is_primary: true,
                },
                orderBy: [
                  { is_primary: 'desc' },
                  { followers_count: 'desc' },
                ],
              },
            },
          },
        },
      }) as Promise<PublicTalentResult[]>,
      this.prisma.user.count({ where }),
    ]);

    // Format and filter by followers if needed
    let formattedTalents = talents.map((talent) => {
      const socialAccounts = talent.talentProfile?.socialAccounts || [];
      const primarySocial = socialAccounts.find(s => s.is_primary);
      const totalFollowers = socialAccounts.reduce(
        (sum, acc) => sum + (acc.followers_count || 0),
        0
      );

      return {
        id: talent.id,
        display_name: talent.profile?.display_name || 'Anonymous',
        profile_image_url: talent.profile?.profile_image_url,
        bio: talent.profile?.bio,
        talent_type: talent.talentProfile?.talent_type,
        categories: talent.talentProfile?.categories || [],
        specializations: talent.talentProfile?.specializations || [],
        verify_badge: talent.talentProfile?.verify_badge || false,
        experience_level: talent.talentProfile?.experience_level,
        location: talent.profile?.location_city && talent.profile?.location_state
          ? `${talent.profile.location_city}, ${talent.profile.location_state}`
          : null,
        followers: totalFollowers,
        primary_platform: primarySocial?.platform,
        social_accounts: socialAccounts.map(acc => ({
          platform: acc.platform,
          handle: acc.handle,
          followers: acc.followers_count,
          is_verified: acc.is_verified,
        })),
        rates: {
          per_live: talent.talentProfile?.rate_per_live,
          per_video: talent.talentProfile?.rate_per_video,
          per_post: talent.talentProfile?.rate_per_post,
          currency: talent.talentProfile?.currency,
        },
      };
    });

    // Filter by minimum followers if specified
    if (min_followers) {
      formattedTalents = formattedTalents.filter(t => t.followers >= min_followers);
    }

    return {
      success: true,
      data: formattedTalents,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };
  }
  /**
   * Public: Get complete talent profile for detail page
   */
  async getTalentProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, is_active: true },
      select: {
        id: true,
        email: true,
        user_type: true,
        is_premium: true,
        created_at: true,
        profile: {
          select: {
            display_name: true,
            first_name: true,
            last_name: true,
            bio: true,
            profile_image_url: true,
            banner_image_url: true,
            location_city: true,
            location_state: true,
            location_country: true,
            website_url: true,
            languages: true,
            gender: true,
            whatsapp: true,
          },
        },
        talentProfile: {
          select: {
            talent_type: true,
            categories: true,
            specializations: true,
            experience_level: true,
            years_of_experience: true,
            rate_per_live: true,
            rate_per_video: true,
            rate_per_post: true,
            currency: true,
            availability_status: true,
            portfolio_description: true,
            achievements: true,
            awards: true,
            certifications: true,
            collaboration_preferences: true,
            verify_badge: true,
            socialAccounts: {
              select: {
                platform: true,
                handle: true,
                profile_url: true,
                followers_count: true,
                engagement_rate: true,
                is_verified: true,
                is_primary: true,
              },
              orderBy: [
                { is_primary: 'desc' },
                { followers_count: 'desc' },
              ],
            },
          },
        },
        reviewsReceived: {
          take: 10,
          orderBy: { created_at: 'desc' },
          select: {
            id: true,
            rating: true,
            // comment: true,
            created_at: true,
            reviewer: {
              select: {
                id: true,
                profile: {
                  select: {
                    display_name: true,
                    profile_image_url: true,
                  },
                },
              },
            },
          },
        },
      },
    }) as TalentProfileResult | null;

    if (!user) {
      throw new NotFoundException('Talent profile not found');
    }

    // Calculate average rating
    const avgRating = await this.prisma.review.aggregate({
      where: { reviewee_id: userId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    // Calculate total followers from social accounts
    const socialAccounts = user.talentProfile?.socialAccounts || [];
    const totalFollowers = socialAccounts.reduce(
      (sum, acc) => sum + (acc.followers_count || 0),
      0
    );

    return {
      success: true,
      data: {
        id: user.id,
        display_name: user.profile?.display_name,
        first_name: user.profile?.first_name,
        last_name: user.profile?.last_name,
        bio: user.profile?.bio,
        profile_image_url: user.profile?.profile_image_url,
        banner_image_url: user.profile?.banner_image_url,
        location: {
          city: user.profile?.location_city,
          state: user.profile?.location_state,
          country: user.profile?.location_country,
        },
        website_url: user.profile?.website_url,
        languages: user.profile?.languages,
        gender: user.profile?.gender,
        whatsapp: user.profile?.whatsapp,
        is_premium: user.is_premium,
        member_since: user.created_at,

        // Talent specific
        talent_type: user.talentProfile?.talent_type,
        categories: user.talentProfile?.categories || [],
        specializations: user.talentProfile?.specializations || [],
        experience_level: user.talentProfile?.experience_level,
        years_of_experience: user.talentProfile?.years_of_experience,
        availability_status: user.talentProfile?.availability_status,
        verify_badge: user.talentProfile?.verify_badge || false,

        // Rates
        rates: {
          per_live: user.talentProfile?.rate_per_live,
          per_video: user.talentProfile?.rate_per_video,
          per_post: user.talentProfile?.rate_per_post,
          currency: user.talentProfile?.currency,
        },

        // Portfolio
        portfolio_description: user.talentProfile?.portfolio_description,
        achievements: user.talentProfile?.achievements,
        awards: user.talentProfile?.awards || [],
        certifications: user.talentProfile?.certifications || [],
        collaboration_preferences: user.talentProfile?.collaboration_preferences || [],

        // Social media
        total_followers: totalFollowers,
        social_accounts: socialAccounts.map(acc => ({
          platform: acc.platform,
          handle: acc.handle,
          profile_url: acc.profile_url,
          followers_count: acc.followers_count,
          engagement_rate: acc.engagement_rate,
          is_verified: acc.is_verified,
          is_primary: acc.is_primary,
        })),

        // Reviews
        rating: {
          average: avgRating._avg.rating || 0,
          count: avgRating._count.rating || 0,
        },
        recent_reviews: user.reviewsReceived.map(review => ({
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          created_at: review.created_at,
          reviewer: {
            id: review.reviewer.id,
            name: review.reviewer.profile?.display_name || 'Anonymous',
            avatar: review.reviewer.profile?.profile_image_url,
          },
        })),
      },
    };
  }

  // ==================== EXISTING METHODS ====================

  async createUser(data: { email: string; password: string; phone?: string; user_type: string }) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new BadRequestException('Email already exists');

    const password_hash = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password_hash,
        phone: data.phone,
        user_type: data.user_type,
      },
      select: this.userSelect,
    });

    return { message: 'User created', user };
  }

  async getUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.userSelect,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getUserWithProfile(id: string, includeRelations: {
    profile?: boolean;
    talentProfile?: boolean;
    socialAccounts?: boolean;
    subscriptions?: boolean;
    reviews?: boolean;
  } = {}) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        ...this.userSelect,
        profile: includeRelations.profile || false,
        talentProfile: includeRelations.talentProfile ? {
          include: {
            socialAccounts: includeRelations.socialAccounts || false,
          },
        } : false,
        subscriptions: includeRelations.subscriptions || false,
        reviewsReceived: includeRelations.reviews ? {
          take: 10,
          orderBy: { created_at: 'desc' },
          include: {
            reviewer: {
              select: {
                id: true,
                profile: {
                  select: {
                    display_name: true,
                    profile_image_url: true,
                  },
                },
              },
            },
          },
        } : false,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getAllUsers(params: {
    skip?: number;
    take?: number;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
    includeProfile?: boolean;
    includeTalent?: boolean;
  } = {}) {
    const {
      skip = 0,
      take = 20,
      where,
      orderBy,
      includeProfile = false,
      includeTalent = false,
    } = params;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take,
        where: { ...where, is_active: true },
        orderBy: orderBy || { created_at: 'desc' },
        select: {
          ...this.userSelect,
          profile: includeProfile,
          talentProfile: includeTalent,
        },
      }),
      this.prisma.user.count({ where: { ...where, is_active: true } }),
    ]);

    return {
      data: users,
      meta: {
        total,
        skip,
        take,
        page: Math.floor(skip / take) + 1,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async searchUsers(params: {
    search?: string;
    user_type?: string;
    is_premium?: boolean;
    talent_type?: string;
    location_city?: string;
    skip?: number;
    take?: number;
  }) {
    const { search, user_type, is_premium, talent_type, location_city, skip = 0, take = 20 } = params;

    const where: Prisma.UserWhereInput = {
      is_active: true,
      ...(user_type && { user_type }),
      ...(is_premium !== undefined && { is_premium }),
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { profile: { display_name: { contains: search, mode: 'insensitive' } } },
          { profile: { first_name: { contains: search, mode: 'insensitive' } } },
          { profile: { last_name: { contains: search, mode: 'insensitive' } } },
        ],
      }),
      ...(talent_type && {
        talentProfile: { talent_type: talent_type as any },
      }),
      ...(location_city && {
        profile: { location_city: { equals: location_city, mode: 'insensitive' } },
      }),
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take,
        where,
        select: {
          ...this.userSelect,
          profile: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              display_name: true,
              profile_image_url: true,
              location_city: true,
              location_state: true,
            },
          },
          talentProfile: talent_type ? {
            select: {
              id: true,
              talent_type: true,
              experience_level: true,
              rate_per_live: true,
              verify_badge: true,
              availability_status: true,
            },
          } : false,
        },
        orderBy: [
          { is_premium: 'desc' },
          { created_at: 'desc' },
        ],
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        skip,
        take,
        page: Math.floor(skip / take) + 1,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async updateUser(id: string, data: Partial<Prisma.UserUpdateInput>) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id },
      data,
      select: this.userSelect,
    });
  }

  async softDelete(id: string) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { is_active: false },
      select: this.userSelect,
    });
    return { message: 'User deactivated', user };
  }

  async hardDelete(id: string) {
    await this.prisma.user.delete({ where: { id } });
    return { message: 'User permanently deleted' };
  }

  async getStats() {
    const [total, active, premium, byType] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { is_active: true } }),
      this.prisma.user.count({ where: { is_premium: true } }),
      this.prisma.user.groupBy({
        by: ['user_type'],
        _count: true,
      }),
    ]);

    return {
      total,
      active,
      premium,
      inactive: total - active,
      byType: byType.map(t => ({ type: t.user_type, count: t._count })),
    };
  }
}