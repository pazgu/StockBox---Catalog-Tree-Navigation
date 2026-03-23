/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import mongoose from 'mongoose';
import { Group, GroupDocument } from './../schemas/Groups.schema';
import { CreateGroupDto } from './dto/createGroup.dto';
import { UpdateGroupDto } from './dto/updateGroup.dto';
import { PermissionsService } from 'src/permissions/permissions.service';
import { forwardRef } from '@nestjs/common';
import { SocketService } from 'src/socket/socket.service';
import { User, UserRole } from 'src/schemas/Users.schema';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name)
    private readonly groupModel: Model<GroupDocument>,
    @Inject(forwardRef(() => PermissionsService))
    private permissionsService: PermissionsService,
    private readonly socketService: SocketService,
  ) { }

  async findAll(): Promise<GroupDocument[]> {
    return this.groupModel
      .find()
      .populate('members', 'userName firstName lastName')
      .exec();
  }

  async findById(id: string, populateMembers = false): Promise<GroupDocument> {
    const query = this.groupModel.findById(id);

    if (populateMembers) {
      query.populate('members', 'userName firstName lastName');
    }

    const group = await query.exec();

    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    return group;
  }

  async create(createGroupDto: CreateGroupDto): Promise<GroupDocument> {
    const existingGroup = await this.groupModel.findOne({
      groupName: createGroupDto.groupName,
    });

    if (existingGroup) {
      throw new ConflictException(`שם זה כבר קיים. נא לבחור שם ייחודי אחר.`);
    }

    const newGroup = new this.groupModel(createGroupDto);
    await newGroup.save();

    await newGroup.populate('members', 'username firstName lastName');

    this.socketService.emitToRole(UserRole.EDITOR, 'new_group_created', {
      id: newGroup._id.toString(),
      name: newGroup.groupName,
      members:
        newGroup.members?.map((m: any) =>
          typeof m === 'string' ? m : m._id.toString(),
        ) ?? [],
    });

    return newGroup;
  }

  async update(
    id: string,
    updateGroupDto: UpdateGroupDto,
  ): Promise<GroupDocument> {
    if (updateGroupDto.groupName) {
      const existingGroup = await this.groupModel.findOne({
        groupName: updateGroupDto.groupName,
        _id: { $ne: id },
      });

      if (existingGroup) {
        throw new ConflictException(`שם זה כבר קיים. נא לבחור שם ייחודי אחר.`);
      }
    }

    const oldMemberIds: Set<string> = new Set();
    if (Array.isArray(updateGroupDto.members)) {
      const groupBefore = await this.groupModel.findById(id).lean().exec();
      if (!groupBefore) throw new NotFoundException(`Group with ID ${id} not found`);
      (groupBefore.members ?? []).forEach((m: any) => oldMemberIds.add(m.toString()));
    }

    const updatedGroup = await this.groupModel
      .findByIdAndUpdate(id, updateGroupDto, { new: true })
      .populate('members', 'username firstName lastName')
      .exec();

    if (!updatedGroup) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    if (
      Array.isArray(updateGroupDto.members) &&
      updateGroupDto.members.length > 0
    ) {
      const defaultGroupName =
        process.env.DEFAULT_NEW_USER_GROUP_NAME || 'New Users';

      if (updatedGroup.groupName !== defaultGroupName) {
        const defaultGroup = await this.groupModel
          .findOne({ groupName: defaultGroupName })
          .exec();

        if (defaultGroup) {
          const memberObjectIds = updateGroupDto.members.map((m: any) =>
            m instanceof mongoose.Types.ObjectId
              ? m
              : new mongoose.Types.ObjectId(m),
          );

          await this.groupModel.updateOne(
            { _id: defaultGroup._id },
            { $pull: { members: { $in: memberObjectIds } } },
          );
        }
      }
    }

    if (Array.isArray(updateGroupDto.members)) {
      const newMemberIds = new Set(
        (updatedGroup.members ?? []).map((m: any) =>
          typeof m === 'object' ? m._id.toString() : m.toString(),
        ),
      );

      const affectedUserIds = [
        ...[...oldMemberIds].filter((uid) => !newMemberIds.has(uid)),
        ...[...newMemberIds].filter((uid) => !oldMemberIds.has(uid)),
      ];

      this.socketService.emitToUsers(affectedUserIds, 'permissions_updated');
    }

    this.socketService.emitToRole(UserRole.EDITOR, 'group_edited', {
      id: updatedGroup._id.toString(),
      name: updatedGroup.groupName,
      members:
        updatedGroup.members?.map((m: any) =>
        typeof m === 'string' ? m : m._id.toString(),
      ) ?? [],
    });
    return updatedGroup;
  }

  async delete(id: string): Promise<void> {
    const result = await this.groupModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    await this.permissionsService.deletePermissionsForAllowed(id);

    this.socketService.emitToRole(UserRole.EDITOR, 'group_deleted', {
      id: result._id.toString(),
      name: result.groupName,
      members:
        result.members?.map((m: any) =>
          typeof m === 'string' ? m : m._id.toString(),
        ) ?? [],
    });
  }

  async getOrCreateDefaultGroup(): Promise<GroupDocument> {
    const groupName = process.env.DEFAULT_NEW_USER_GROUP_NAME || 'New Users';

    let group = await this.groupModel.findOne({ groupName }).exec();

    if (!group) {
      group = new this.groupModel({
        groupName,
        members: [],
      });

      await group.save();
    }

    return group;
  }

  async getAllGroupIds(): Promise<mongoose.Types.ObjectId[]> {
    return this.groupModel.distinct('_id');
  }
  async getUserIdsInGroups(groupIds: string[]): Promise<string[]> {
    if (!groupIds.length) return [];

    const groups = await this.groupModel
      .find({ _id: { $in: groupIds } }, { members: 1 })
      .lean();

    const allUserIds = groups.flatMap((g) =>
      (g.members || []).map((id: any) => id.toString()),
    );

    return Array.from(new Set(allUserIds));
  }
  async getGroupByUserId(userId: string) {
    return this.groupModel.findOne({
      members: userId,
    });
  }
}
