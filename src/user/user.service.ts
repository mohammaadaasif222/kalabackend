import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

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
    });

    return { message: 'User created', user };
  }

  async getUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getAllUsers(params?: Prisma.UserFindManyArgs) {
    return this.prisma.user.findMany(params);
  }

  async updateUser(id: string, data: Partial<Prisma.UserUpdateInput>) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { is_active: false },
    });
    return { message: 'User deactivated', user };
  }

  async hardDelete(id: string) {
    await this.prisma.user.delete({ where: { id } });
    return { message: 'User permanently deleted' };
  }

  async getStats() {
    const total = await this.prisma.user.count();
    const active = await this.prisma.user.count({ where: { is_active: true } });
    const premium = await this.prisma.user.count({ where: { is_premium: true } });
    return { total, active, premium };
  }
}
