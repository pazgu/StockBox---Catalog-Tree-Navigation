/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { User, FavoriteType, UserRole } from 'src/schemas/Users.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from './dto/createUser.dto';
import { GroupsService } from 'src/groups/groups.service';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>,
  private groupsService: GroupsService) {}

  async getAllUsers(role?: string) {
    const filter = role ? { role } : {};
    return this.userModel.find(filter).exec();
  }
  async createUser(createUserDto: CreateUserDto) {
   const newUser = new this.userModel(createUserDto);
  const savedUser = await newUser.save();

  if (savedUser.role !== UserRole.EDITOR) {
    const defaultGroup =
      await this.groupsService.getOrCreateDefaultGroup();

    defaultGroup.members.push(savedUser._id.toString());
    await defaultGroup.save();
  }

  return savedUser;
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
    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid user ID');
      }
      if (!Types.ObjectId.isValid(itemId)) {
        throw new BadRequestException('Invalid item ID');
      }
      const objectId = new Types.ObjectId(itemId);
      const user = await this.userModel
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
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to add favorite');
    }
  }
  async removeFavorite(userId: string, itemId: string) {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid user ID');
      }
      if (!Types.ObjectId.isValid(itemId)) {
        throw new BadRequestException('Invalid item ID');
      }
      const objectId = new Types.ObjectId(itemId);
      const user = await this.userModel
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
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to remove favorite');
    }
  }
  async getUserFavorites(userId: string) {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid user ID');
      }
      const user = await this.userModel
        .findById(userId)
        .select('favorites')
        .exec();
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user.favorites || [];
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch favorites');
    }
  }
  async isFavorite(userId: string, itemId: string): Promise<boolean> {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid user ID');
      }
      if (!Types.ObjectId.isValid(itemId)) {
        throw new BadRequestException('Invalid item ID');
      }
      const objectId = new Types.ObjectId(itemId);
      const exists = await this.userModel.exists({
        _id: userId,
        'favorites.id': objectId,
      });
      return !!exists;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to check favorite status');
    }
  }

  async getAllUserIds(): Promise<string[]> {
    const users = await this.userModel.find().select('_id').lean();
    return users.map(u => u._id.toString());
  }
  
}
