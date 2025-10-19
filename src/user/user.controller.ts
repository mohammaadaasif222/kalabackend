import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  createUser(@Body() body: { email: string; password: string; phone?: string; user_type: string }) {
    return this.userService.createUser(body);
  }

  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.userService.getUser(id);
  }

  @Get()
  getAllUsers(@Query() query: any) {
    return this.userService.getAllUsers({ where: query });
  }

  @Patch(':id')
  updateUser(@Param('id') id: string, @Body() body: any) {
    return this.userService.updateUser(id, body);
  }

  @Delete('soft/:id')
  softDelete(@Param('id') id: string) {
    return this.userService.softDelete(id);
  }

  @Delete('hard/:id')
  hardDelete(@Param('id') id: string) {
    return this.userService.hardDelete(id);
  }

  @Get('stats/summary')
  getStats() {
    return this.userService.getStats();
  }
}
