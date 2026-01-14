/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { User, FavoriteType } from 'src/schemas/Users.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from './dto/createUser.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async getAllUsers(role?: string) {
    const filter = role ? { role } : {};
    return this.userModel.find(filter).exec();
  }
  async createUser(createUserDto: CreateUserDto) {
    const newUser = new this.userModel(createUserDto);
    return newUser.save();
  }

  async createUserFromLogin(createUserFromLoginDto: CreateUserDto) {
    const newUser = new this.userModel(createUserFromLoginDto);
    return newUser.save();
  }

  async deleteUser(id: string) {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  updateUser(id: string, updateUserDto: Partial<CreateUserDto>) {
    return this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
  }

  toggleBlockUser(id: string, isBlocked: boolean) {
    return this.userModel
      .findByIdAndUpdate(id, { isBlocked }, { new: true })
      .exec();
  }
  async addFavorite(userId: string, itemId: string, type: FavoriteType) {
    const objectId = new Types.ObjectId(itemId);
    return this.userModel
      .findByIdAndUpdate(
        userId,
        {
          $addToSet: {
            favorites: { id: objectId, type },
          },
        },
        { new: true },
      )
      .exec();
  }
  async removeFavorite(userId: string, itemId: string) {
    const objectId = new Types.ObjectId(itemId);
    return this.userModel
      .findByIdAndUpdate(
        userId,
        {
          $pull: {
            favorites: { id: objectId },
          },
        },
        { new: true },
      )
      .exec();
  }
  async getUserFavorites(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    return user?.favorites || [];
  }
  async isFavorite(userId: string, itemId: string): Promise<boolean> {
    const user = await this.userModel.findById(userId).exec();
    return (
      user?.favorites?.some((fav) => fav.id.toString() === itemId) || false
    );
  }
}
