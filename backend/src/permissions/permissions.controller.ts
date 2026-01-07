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
  createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.createPermission(createPermissionDto);
  }
  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getAllPermissions(@Req() req) {
    const userId = req.user.userId;
    const permissions = await this.permissionsService.getAllPermissions(userId);
    return permissions;
  }
  @Delete(':id')
  async deletePermission(@Param('id') id: string) {
    const deleted = await this.permissionsService.deletePermission(id);
    if (!deleted) {
      return { status: 'fail', message: 'Permission not found' };
    }
    return { status: 'ok', deleted };
  }
}
