import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/createGroup.dto';
import { UpdateGroupDto } from './dto/updateGroup.dto';
import { GroupResponseDto, PopulatedMember } from './dto/groupResponse.dto';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  async getAllGroups(): Promise<GroupResponseDto[]> {
    const groups = await this.groupsService.findAll();

    return groups.map((group) => ({
      id: group._id.toString(),
      groupName: group.groupName,
      members: (group.members as unknown as PopulatedMember[]).map((m) => ({
        id: m._id.toString(),
        username: m.username,
        firstName: m.firstName,
        lastName: m.lastName,
      })),
    }));
  }

  @Get(':id')
  async getGroup(@Param('id') id: string): Promise<GroupResponseDto> {
    const group = await this.groupsService.findById(id, true);

    return {
      id: group._id.toString(),
      groupName: group.groupName,
      members: (group.members as unknown as PopulatedMember[]).map((m) => ({
        id: m._id.toString(),
        username: m.username,
        firstName: m.firstName,
        lastName: m.lastName,
      })),
    };
  }

  @Post()
  async createGroup(
    @Body() createGroupDto: CreateGroupDto,
  ): Promise<GroupResponseDto> {
    const group = await this.groupsService.create(createGroupDto);

    return {
      id: group._id.toString(),
      groupName: group.groupName,
      members: (group.members as unknown as PopulatedMember[]).map((m) => ({
        id: m._id.toString(),
        username: m.username,
        firstName: m.firstName,
        lastName: m.lastName,
      })),
    };
  }

  @Patch(':id')
  async updateGroup(
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto,
  ): Promise<GroupResponseDto> {
    const group = await this.groupsService.update(id, updateGroupDto);

    return {
      id: group._id.toString(),
      groupName: group.groupName,
      members: (group.members as unknown as PopulatedMember[]).map((m) => ({
        id: m._id.toString(),
        username: m.username,
        firstName: m.firstName,
        lastName: m.lastName,
      })),
    };
  }

  @Delete(':id')
  async deleteGroup(@Param('id') id: string): Promise<{ message: string }> {
    await this.groupsService.delete(id);
    return { message: 'Group deleted successfully' };
  }
}
