import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';

// Add these guards based on your auth setup
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';
// import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  // ==================== ADMIN APIS ====================

  @Post()
  async createUser(@Body() data: {
    email: string;
    password: string;
    phone?: string;
    user_type: string;
    createdBy: string
  }) {
    return this.userService.createUser(data);
  }
  /**
   * Admin API: Get all users with full details
   * GET /users/admin/list
   */

  @Get('admin/list')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('admin')
  async getAdminUserList(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('search') search?: string,
    @Query('user_type') user_type?: string,
    @Query('talent_type') talent_type?: string,
    @Query('is_premium') is_premium?: string,
    @Query('is_active') is_active?: string,
    @Query('email_verified') email_verified?: string,
    @Query('sortBy') sortBy: string = 'created_at',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    return this.userService.getAdminUserList({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      user_type,
      talent_type,
      is_premium: is_premium ? is_premium === 'true' : undefined,
      is_active: is_active ? is_active === 'true' : undefined,
      email_verified: email_verified ? email_verified === 'true' : undefined,
      sortBy,
      sortOrder,
    });
  }

  @Get('talents')
  async getPublicTalentList(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('search') search?: string,
    @Query('talent_type') talent_type?: string,
    @Query('categories') categories?: string,
    @Query('location_city') location_city?: string,
    @Query('min_followers') min_followers?: string,
    @Query('verified_only') verified_only?: string,
    @Query('sortBy') sortBy: 'followers' | 'created_at' | 'rating' = 'created_at',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    return this.userService.getPublicTalentList({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      talent_type,
      categories,
      location_city,
      min_followers: min_followers ? parseInt(min_followers) : undefined,
      verified_only: verified_only === 'true',
      sortBy,
      sortOrder,
    });
  }
  /**
   * Admin API: Get user statistics
   * GET /users/admin/stats
   */
  @Get('admin/stats')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('admin')
  async getAdminStats() {
    return this.userService.getStats();
  }

  // ==================== PUBLIC/WEBSITE APIS ====================

  /**
   * Public API: Get talent listing for website
   * GET /users/talents
   */


  /**
   * Public API: Get complete talent profile
   * GET /users/talents/:id
   */
  @Get('talents/:id')
  async getTalentProfile(@Param('id') id: string) {
    return this.userService.getTalentProfile(id);
  }

  // ==================== BASIC CRUD APIS ====================



  @Get(':id')
  // @UseGuards(JwtAuthGuard)
  async getUser(@Param('id') id: string) {
    return this.userService.getUser(id);
  }

  @Put(':id')
  // @UseGuards(JwtAuthGuard)
  async updateUser(@Param('id') id: string, @Body() data: any) {
    return this.userService.updateUser(id, data);
  }

  @Delete(':id/soft')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('admin')
  async softDeleteUser(@Param('id') id: string) {
    return this.userService.softDelete(id);
  }

  @Delete(':id/hard')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('admin')
  async hardDeleteUser(@Param('id') id: string) {
    return this.userService.hardDelete(id);
  }
}