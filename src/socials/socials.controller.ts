import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import {
  SocialsService,

} from './socials.service';
import type { CreateSocialAccountDto, UpdateSocialAccountDto } from './dto/scoial.dto';

@Controller('socials')
export class SocialsController {
  constructor(private readonly talentSocialService: SocialsService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createSocialAccountDto: CreateSocialAccountDto
  ) {
    console.log(createSocialAccountDto)
    return this.talentSocialService.create(createSocialAccountDto);
  }

  @Get('talent/:userId')
  async findAll(@Param('userId') userId: string) {
  
    return this.talentSocialService.findByTalentId(userId);
  }

  @Get(':accountId')
  async findOne(@Param('accountId') accountId: string) {
    return this.talentSocialService.findOne(accountId);
  }

  @Patch(':accountId')
  async update(
    @Param('accountId') accountId: string,
    @Body() updateSocialAccountDto: UpdateSocialAccountDto
  ) {
    return this.talentSocialService.update(accountId, updateSocialAccountDto);
  }

  @Patch(':accountId/set-primary')
  async setPrimary(@Param('accountId') accountId: string) {
    return this.talentSocialService.setPrimary(accountId);
  }

  @Delete(':accountId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('accountId') accountId: string) {
    await this.talentSocialService.remove(accountId);
  }
}