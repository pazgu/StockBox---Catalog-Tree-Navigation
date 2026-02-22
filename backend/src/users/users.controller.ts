/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
  UseGuards,
  ValidationPipe,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/createUser.dto';
import { FavoriteType } from 'src/schemas/Users.schema';
import { JwtAuthGuard } from 'src/gaurds/jwt-auth.guard';

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

  @Get('me/favorites')
  @UseGuards(JwtAuthGuard)
  async getMyFavorites(@Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.usersService.getUserFavorites(req.user.userId);
  }
  @Get('me/favorites/:itemId/check')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async isMyFavorite(@Req() req: any, @Param('itemId') itemId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const isFav = await this.usersService.isFavorite(req.user.userId, itemId);
    return { isFavorite: isFav };
  }

  @Patch('me/favorites/toggle')
  @UseGuards(JwtAuthGuard)
  async toggleMyFavorite(
    @Req() req: any,
    @Body() body: { itemId: string; type: FavoriteType },
  ) {
    const { itemId, type } = body;
    const isFavorite = await this.usersService.isFavorite(
      req.user.userId,
      itemId,
    );

    if (isFavorite) {
      return this.usersService.removeFavorite(req.user.userId, itemId);
    } else {
      return this.usersService.addFavorite(req.user.userId, itemId, type);
    }
  }

  @Get(':userId/favorites')
  @UseGuards(JwtAuthGuard)
  async getUserFavorites(@Req() req: any, @Param('userId') userId: string) {
    if (req.user.userId !== userId && req.user.role !== 'admin') {
      throw new ForbiddenException('You can only access your own favorites');
    }
    return this.usersService.getUserFavorites(userId);
  }
}
