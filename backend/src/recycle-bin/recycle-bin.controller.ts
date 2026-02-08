import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RecycleBinService } from './recycle-bin.service';
import { AuthGuard } from '@nestjs/passport';
import { EditorGuard } from 'src/gaurds/editor.guard';
import { RestoreItemDto } from './dtos/RestoreItem.dto';
import { DeletePermanentlyDto } from './dtos/DeletePermanently.dto';
import { MoveCategoryToRecycleBinDto } from './dtos/MoveCategoryToRecycleBin.dto';
import { MoveProductToRecycleBinDto } from './dtos/MoveProductToRecycleBin.dto';

@Controller('recycle-bin')
@UseGuards(AuthGuard('jwt'), EditorGuard)
export class RecycleBinController {
  constructor(private readonly recycleBinService: RecycleBinService) {}

  @Get()
  async getRecycleBinItems() {
    return this.recycleBinService.getRecycleBinItems();
  }

  @Get('stats')
  async getStats() {
    return this.recycleBinService.getStats();
  }

  @Post('category/:id')
  @HttpCode(HttpStatus.OK)
  async moveCategoryToRecycleBin(
    @Param('id') id: string,
    @Body() dto: MoveCategoryToRecycleBinDto,
    @Req() req: any,
  ) {
    return this.recycleBinService.moveCategoryToRecycleBin(
      id,
      dto.strategy || 'cascade',
      req.user?.userId,
    );
  }

  @Post('product/:id')
  @HttpCode(HttpStatus.OK)
  async moveProductToRecycleBin(
    @Param('id') id: string,
    @Body() dto: MoveProductToRecycleBinDto,
    @Req() req: any,
  ) {
    return this.recycleBinService.moveProductToRecycleBin(
      id,
      dto.categoryPath,
      req.user?.userId,
    );
  }

  @Post('restore')
  @HttpCode(HttpStatus.OK)
  async restoreItem(@Body() dto: RestoreItemDto) {
    return this.recycleBinService.restoreItem(
      dto.itemId,  
      dto.restoreChildren,
    );
  }

  @Delete('permanent')
  @HttpCode(HttpStatus.OK)
  async permanentlyDelete(@Body() dto: DeletePermanentlyDto) {
    return this.recycleBinService.permanentlyDelete(
      dto.itemId, 
      dto.deleteChildren,
    );
  }

  @Delete('empty')
  @HttpCode(HttpStatus.OK)
  async emptyRecycleBin() {
    return this.recycleBinService.emptyRecycleBin();
  }
}