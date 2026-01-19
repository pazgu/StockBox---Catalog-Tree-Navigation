/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller, Delete, Get, Post, Param } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { Body } from '@nestjs/common';
import { CreatePermissionDto } from './dto/createPermission.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Req } from '@nestjs/common';
@Controller('permissions')
export class PermissionsController {
  constructor(private permissionsService: PermissionsService) {}
  @Post()
  @UseGuards(AuthGuard('jwt'))
  createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.createPermission(createPermissionDto);
  }
  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getPermissionsForUser(@Req() req) {
    const userId = req.user.userId;
    const permissions =
      await this.permissionsService.getPermissionsForUser(userId);
    return permissions;
  }
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deletePermission(@Param('id') id: string) {
    const deleted = await this.permissionsService.deletePermission(id);
    if (!deleted) {
      return { status: 'fail', message: 'Permission not found' };
    }
    return { status: 'ok', deleted };
  }

  @Get('by-group/:groupId')
  @UseGuards(AuthGuard('jwt'))
  async getPermissionsForGroup(@Param('groupId') groupId: string) {
    return this.permissionsService.getPermissionsForAllowedId(groupId);
  }

  @Get(':entityId')
  @UseGuards(AuthGuard('jwt'))
  async getPermissionsByEntityType(@Param('entityId') entityId: string) {
    return this.permissionsService.getPermissionsByEntityType(entityId);
  }
}
