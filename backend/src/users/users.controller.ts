import { Controller, Delete, Patch, Param } from '@nestjs/common';
import { Post, Body, Get, UsePipes } from '@nestjs/common';
import { UsersService } from './users.service';
import { ValidationPipe } from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}
  @Post()
  @UsePipes(new ValidationPipe())
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Get()
  GetAllUsers() {
    return this.usersService.getAllUsers();
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
}
