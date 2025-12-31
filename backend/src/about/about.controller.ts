import { Body, Controller, Get, Param, Patch, Put } from '@nestjs/common';
import { AboutService } from './about.service';
import { UpdateAboutDto } from './dto/UpdateAbout.dto';
import { UpdateAboutBlockDto } from './dto/UpdateAboutBlock.dto';

@Controller('about')
export class AboutController {
  constructor(private readonly aboutService: AboutService) {}

  @Get()
  getAbout() {
    return this.aboutService.getAbout();
  }

  @Put()
  replaceAbout(@Body() dto: UpdateAboutDto) {
    return this.aboutService.replaceAbout(dto);
  }

  @Patch('blocks/:id')
  updateBlock(@Param('id') id: string, @Body() dto: UpdateAboutBlockDto) {
    return this.aboutService.updateBlock(id, dto);
  }
}
