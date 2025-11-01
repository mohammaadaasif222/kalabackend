import {
  Controller, Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import type { CreateProfileDto, UpdateProfileDto } from './dto/profile.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';


@Controller('profile')

export class ProfileController {
  constructor(private readonly profileService: ProfileService) { }

  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createProfileDto: CreateProfileDto) {
    return this.profileService.create(createProfileDto);
  }

  @Get('search')
  async search(
    @Query('city') city?: string,
    @Query('state') state?: string,
    @Query('country') country?: string,
    @Query('display_name') displayName?: string
  ) {
    return this.profileService.search({
      city,
      state,
      country,
      display_name: displayName
    });
  }
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async findMe(@Request() req) {
    const userId = req.user.sub;
    return this.profileService.findByUserId(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.profileService.findByUserId(id);
  }

  @Post(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateProfileDto
  ) {
    return this.profileService.update(id, updateProfileDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.profileService.remove(id);
  }

}
