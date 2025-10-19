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
    const user = await this.prisma.user.create({
      data: { email, password_hash, user_type },
    });

    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return { user, token };
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

      let user = await this.prisma.user.findUnique({ where: { email } });

      let action = 'login';

      if (!user) {
     
        user = await this.prisma.user.create({
          data: {
            google_id,
            email,
            user_type: 'user',
            password_hash: 'google-auth', 
          },
        });
        action = 'register';
      } else if (!user.google_id) {
        user = await this.prisma.user.update({
          where: { email },
          data: { google_id },
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

  // Get current profile
  async profile(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }
}