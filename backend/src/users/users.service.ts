/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { User, FavoriteType, UserRole } from 'src/schemas/Users.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from './dto/createUser.dto';
import { GroupsService } from 'src/groups/groups.service';
import { PermissionsService } from 'src/permissions/permissions.service';
import { forwardRef } from '@nestjs/common';
import { SocketService } from 'src/socket/socket.service';
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private groupsService: GroupsService,
    private socketService: SocketService,
    @Inject(forwardRef(() => PermissionsService))
    private permissionsService: PermissionsService,
  ) { }

  async getAllUsers(role?: string, approved?: string) {
    const filter: any = {};

    if (role) {
      filter.role = role;
    }

    if (approved === 'true') {
      filter.approved = true;
    } else if (approved === 'false') {
      filter.approved = false;
    }

    return this.userModel.find(filter).exec();
  }
  async createUser(createUserDto: CreateUserDto) {
    const existing = await this.userModel.findOne({
      $or: [
        { userName: createUserDto.userName },
        { email: createUserDto.email },
      ],
    });

    if (existing) {
      throw new ConflictException('שם משתמש או אימייל כבר קיימים במערכת');
    }

    const newUser = new this.userModel(createUserDto);
    const savedUser = await newUser.save();

    if (savedUser.role !== UserRole.EDITOR) {
      const defaultGroup = await this.groupsService.getOrCreateDefaultGroup();

      const userObjectId =
        savedUser._id instanceof Types.ObjectId
          ? savedUser._id
          : new Types.ObjectId(savedUser._id);

      defaultGroup.members.push(userObjectId);
      await defaultGroup.save();
    }

    return savedUser;
  }

  async createUserFromLogin(createUserFromLoginDto: CreateUserDto) {
    const newUser = new this.userModel(createUserFromLoginDto);
    return newUser.save();
  }

  async deleteUser(id: string) {
    await this.permissionsService.deletePermissionsForAllowed(id);
    const deleted = await this.userModel.findByIdAndDelete(id).exec();
    if (deleted) {
      this.socketService.emitToUser(id, 'user_deleted_self', {});
      this.socketService.emitToRole('editor', 'user_deleted', {
        id,
        name: `${deleted.firstName} ${deleted.lastName}`,
      });
    }
    return deleted;
  }

  async updateUser(id: string, updateUserDto: Partial<CreateUserDto>) {
    if (updateUserDto.userName || updateUserDto.email) {
      const existing = await this.userModel.findOne({
        _id: { $ne: id },
        $or: [
          ...(updateUserDto.userName
            ? [{ userName: updateUserDto.userName }]
            : []),
          ...(updateUserDto.email ? [{ email: updateUserDto.email }] : []),
        ],
      });

      if (existing) {
        throw new ConflictException('שם משתמש או אימייל כבר קיימים במערכת');
      }
    }

    const oldUser = await this.userModel.findById(id).select('role approved').lean();

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();

    if (!updatedUser) return updatedUser;

    const roleChanged =
      oldUser && updateUserDto.role && oldUser.role !== updateUserDto.role;

    if (roleChanged) {
      this.socketService.emitToUser(id, 'user_role_changed', {
        newRole: updatedUser.role,
      });
    }

    const justApproved =
      oldUser && !oldUser.approved && updateUserDto.approved === true;

    if (justApproved) {
      this.socketService.emitToRole(UserRole.EDITOR, 'user_approved', updatedUser);
    }

    this.socketService.emitToRole(UserRole.EDITOR, 'user_updated', updatedUser);

    return updatedUser;
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
              favorites: { id: { $in: [objectId, itemId] } },
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

  async removeItemFromAllUserFavorites(itemId: string): Promise<void> {
    try {
      if (!Types.ObjectId.isValid(itemId)) {
        throw new BadRequestException('Invalid item ID');
      }
      const objectId = new Types.ObjectId(itemId);

      await this.userModel.updateMany(
        { 'favorites.id': objectId },
        { $pull: { favorites: { id: objectId } } },
      );
    } catch (error) {
      console.error('Failed to remove item from user favorites:', error);
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
        $or: [{ 'favorites.id': objectId }, { 'favorites.id': itemId }],
      });

      return !!exists;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to check favorite status');
    }
  }

  async getAllUserIds(): Promise<string[]> {
    const users = await this.userModel.find().select('_id').lean();
    return users.map((u) => u._id.toString());
  }
  async getAllViewerIds(): Promise<string[]> {
    const users = await this.userModel
      .find({ role: UserRole.VIEWER })
      .select('_id')
      .lean();

    return users.map((u) => u._id.toString());
  }
}
