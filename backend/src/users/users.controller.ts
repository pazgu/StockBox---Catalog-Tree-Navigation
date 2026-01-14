/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Delete,
  Patch,
  Param,
  Get,
  Query,
  Post,
  Body,
  UsePipes,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ValidationPipe } from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import { FavoriteType } from 'src/schemas/Users.schema';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}
  @Post()
  @UsePipes(new ValidationPipe())
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Get()
  GetAllUsers(@Query('role') role?: string) {
    return this.usersService.getAllUsers(role);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    const deleted = await this.usersService.deleteUser(id);
    if (!deleted) {
      return { status: 'fail', message: 'User not found' };
    }
    return { status: 'ok', deleted };
  }

  @Patch(':id')
  updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: Partial<CreateUserDto>,
  ) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Patch(':id/block')
  toggleBlockUser(
    @Param('id') id: string,
    @Body('isBlocked') isBlocked: boolean,
  ) {
    return this.usersService.toggleBlockUser(id, isBlocked);
  }

  @Get(':userId/favorites/:itemId/check')
  async isFavorite(
    @Param('userId') userId: string,
    @Param('itemId') itemId: string,
  ) {
    const isFav = await this.usersService.isFavorite(userId, itemId);
    return { isFavorite: isFav };
  }

  @Patch(':userId/favorites/toggle')
  async toggleFavorite(
    @Param('userId') userId: string,
    @Body() body: { itemId: string; type: FavoriteType },
  ) {
    const { itemId, type } = body;
    const isFavorite = await this.usersService.isFavorite(userId, itemId);
    if (isFavorite) {
      return this.usersService.removeFavorite(userId, itemId);
    } else {
      return this.usersService.addFavorite(userId, itemId, type);
    }
  }

  @Get(':userId/favorites')
  async getUserFavorites(@Param('userId') userId: string) {
    return this.usersService.getUserFavorites(userId);
  }
}
