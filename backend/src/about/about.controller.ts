import { AboutService } from './about.service';
import { UpdateAboutDto } from './dto/UpdateAbout.dto';
import { UpdateAboutBlockDto } from './dto/UpdateAboutBlock.dto';
import type { Multer } from 'multer';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { aboutUploadsOptions } from './aboutUploads';

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

  @Post('images')
  @UseInterceptors(FilesInterceptor('files', 10, aboutUploadsOptions))
  addImages(@UploadedFiles() files: Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const urls = files.map((f) => `/about-uploads/images/${f.filename}`);
    return this.aboutService.addImages(urls);
  }

  @Put('images/:index')
  @UseInterceptors(FileInterceptor('file', aboutUploadsOptions))
  replaceImage(
    @Param('index', ParseIntPipe) index: number,
    @UploadedFile() file: Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const url = `/about-uploads/images/${file.filename}`;
    return this.aboutService.replaceImageAt(index, url);
  }

  @Delete('images/:index')
  deleteImage(@Param('index', ParseIntPipe) index: number) {
    return this.aboutService.deleteImageAt(index);
  }

  @Delete('images')
  clearImages() {
    return this.aboutService.clearImages();
  }
}
