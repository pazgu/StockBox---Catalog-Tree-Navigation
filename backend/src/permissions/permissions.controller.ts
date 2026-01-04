import { Controller, Delete, Get, Post, Param } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { Body } from '@nestjs/common';
import { CreatePermissionDto } from './dto/createPermission.dto';
@Controller('permissions')
export class PermissionsController {
  constructor(private permissionsService: PermissionsService) {}
  @Post()
  createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.createPermission(createPermissionDto);
  }
  @Get()
  GetAllPermissions() {
    return this.permissionsService.getAllPermissions();
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
