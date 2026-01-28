/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Delete,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/createPermission.dto';
import { AuthGuard } from '@nestjs/passport';
@Controller('permissions')
export class PermissionsController {
  constructor(private permissionsService: PermissionsService) {}
  @Post()
  @UseGuards(AuthGuard('jwt'))
  createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.createPermission(createPermissionDto);
  }
  @Post('batch')
  @UseGuards(AuthGuard('jwt'))
  async createPermissionsBatch(
    @Body() body: { permissions: CreatePermissionDto[] },
  ) {
    return this.permissionsService.createPermissionsBatch(body.permissions);
  }
  @Post('batch-delete')
  @UseGuards(AuthGuard('jwt'))
  async deletePermissionsBatch(@Body() body: { permissionIds: string[] }) {
    return this.permissionsService.deletePermissionsBatch(body.permissionIds);
  }
  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getPermissionsForUser(@Req() req) {
    const userId = req.user.userId;
    const permissions =
      await this.permissionsService.getPermissionsForUser(userId);
    return permissions;
  }
  @Get('blocked-items/:groupId')
  @UseGuards(AuthGuard('jwt'))
  async getBlockedItemsForGroup(@Param('groupId') groupId: string) {
    return this.permissionsService.getBlockedItemsForGroup(groupId);
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
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deletePermission(@Param('id') id: string) {
    const deleted = await this.permissionsService.deletePermission(id);
    if (!deleted) {
      return { status: 'fail', message: 'Permission not found' };
    }
    return { status: 'ok', deleted };
  }
}
