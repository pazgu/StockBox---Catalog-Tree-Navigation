import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { User } from 'src/schemas/Users.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from './dto/createUser.dto';
@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  getAllUsers() {
    return this.userModel.find().exec();
  }
  async createUser(createUserDto: CreateUserDto) {
    const newUser = new this.userModel(createUserDto);
    return newUser.save();
  }
}
