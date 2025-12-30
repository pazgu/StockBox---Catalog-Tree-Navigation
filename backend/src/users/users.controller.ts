import { Controller, Delete, Patch, Param } from '@nestjs/common';
import { Post, Body, Get, UsePipes } from '@nestjs/common';
import { UsersService } from './users.service';
import { ValidationPipe } from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}
  @Post()
  // method specified validation
  @UsePipes(new ValidationPipe())
  createUser(@Body() createUserDto: CreateUserDto) {
    console.log(createUserDto);
    return this.usersService.createUser(createUserDto);
  }

  @Get()
  GetAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Delete(':id')
  deleteUser(@Body('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  @Patch(':id')
  updateUser(
    @Param('id') id: string, // <-- use Param!
    @Body() updateUserDto: Partial<CreateUserDto>,
  ) {
    return this.usersService.updateUser(id, updateUserDto);
  }
}
