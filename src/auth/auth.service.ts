import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
  private client: OAuth2Client;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {
    this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  // Register new user
  async register(email: string, password: string, user_type: string) {
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new BadRequestException('Email already exists');

    const password_hash = await bcrypt.hash(password, 10);

    const user = await this.prisma.$transaction(async (tx) => {
      return await tx.user.create({
        data: {
          email,
          password_hash,
          user_type,
          profile: {
            create: {
              first_name: '',
              last_name: '',
            },
          },
          talentProfile: {
            create: {},
          },
        },
        include: {
          profile: true,
          talentProfile: true,
        },
      });
    }, {
      maxWait: 10000,
      timeout: 10000,
    });

    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return { user, token };
  }

  
  async googleLogin(token: string) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Invalid Google token');
      }

      const { sub: google_id, email, name, picture } = payload;

      if (!email) {
        throw new BadRequestException('Email not provided by Google');
      }

      let user = await this.prisma.user.findUnique({
        where: { email },
        include: {
          profile: true,
          talentProfile: true,
        }
      });

      let action = 'login';

      if (!user) {
        // New user - create with profile and talent using nested create
        user = await this.prisma.$transaction(async (tx) => {
          return await tx.user.create({
            data: {
              google_id,
              email,
              user_type: 'user',
              password_hash: 'google-auth',
              profile: {
                create: {
                  display_name: name || null,
                  profile_image_url: picture || null,
                },
              },
              talentProfile: {
                create: {},
              },
            },
            include: {
              profile: true,
              talentProfile: true,
            },
          });
        }, {
          maxWait: 10000,
          timeout: 10000,
        });

        action = 'register';
      } else if (!user.google_id) {
        // Link Google account to existing user
        user = await this.prisma.user.update({
          where: { email },
          data: { google_id },
          include: {
            profile: true,
            talentProfile: true,
          },
        });
      }

      const jwtToken = this.jwtService.sign({ sub: user.id, email: user.email });

      return {
        success: true,
        action,
        user,
        token: jwtToken,
      };
    } catch (error) {
      console.error('Google Auth error:', error);
      throw new UnauthorizedException('Google authentication failed');
    }
  }

  // Login user
  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
   
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return { user, token };
  }

  async updatePassword(id: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.prisma.user.update({
      where: { id },
      data: { password_hash: hashedPassword },
    });
    
    return {
      message: 'Password updated successfully',
    };
  }

  // Get current profile
  async profile(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }
}