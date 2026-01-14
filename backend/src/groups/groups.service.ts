import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Group, GroupDocument } from './../schemas/Groups.schema';
import { CreateGroupDto } from './dto/createGroup.dto';
import { UpdateGroupDto } from './dto/updateGroup.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name)
    private readonly groupModel: Model<GroupDocument>,
  ) {}

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
      throw new ConflictException(
        `Group with name "${createGroupDto.groupName}" already exists`,
      );
    }

    const newGroup = new this.groupModel(createGroupDto);
    await newGroup.save();

    await newGroup.populate('members', 'username firstName lastName');

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
        throw new ConflictException(
          `Group with name "${updateGroupDto.groupName}" already exists`,
        );
      }
    }

    const updatedGroup = await this.groupModel
      .findByIdAndUpdate(id, updateGroupDto, { new: true })
      .populate('members', 'username firstName lastName')
      .exec();

    if (!updatedGroup) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    return updatedGroup;
  }

  async delete(id: string): Promise<void> {
    const result = await this.groupModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }
  }
}
