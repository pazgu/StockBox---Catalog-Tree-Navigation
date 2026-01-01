/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateAboutDto } from './dto/UpdateAbout.dto';
import { UpdateAboutBlockDto } from './dto/UpdateAboutBlock.dto';
import { About, AboutDocument } from './schemas/About.schema';
import { promises as fs } from 'fs';
import { join } from 'path';

const ABOUT_SINGLETON_ID = 'ABOUT_SINGLETON';

@Injectable()
export class AboutService {
  constructor(
    @InjectModel(About.name) private readonly aboutModel: Model<AboutDocument>,
  ) {}

  private async getOrCreateSingleton(): Promise<AboutDocument> {
    const existing = await this.aboutModel.findById(ABOUT_SINGLETON_ID).exec();
    if (existing) return existing;

    return this.aboutModel.create({
      _id: ABOUT_SINGLETON_ID,
      blocks: [],
      images: [],
    });
  }

  private uploadsDir() {
    return join(process.cwd(), 'src', 'about', 'aboutUploads', 'images');
  }

  private filePathFromUrl(url: string) {
    const filename = url.split('/').pop()?.split('?')[0];

    if (!filename) return null;
    return join(this.uploadsDir(), filename);
  }

  private async safeUnlinkByUrl(url?: string | null) {
    if (!url) return;
    const path = this.filePathFromUrl(url);
    if (!path) return;

    try {
      await fs.unlink(path);
    } catch {
      /* empty */
    }
  }

  async getAbout() {
    const doc = await this.getOrCreateSingleton();
    return {
      blocks: doc.blocks ?? [],
      images: doc.images ?? [],
      updatedAt: doc.updatedAt,
    };
  }

  async replaceAbout(dto: UpdateAboutDto) {
    const doc = await this.getOrCreateSingleton();

    const oldImages = doc.images ?? [];
    const newImages = dto.images ?? [];

    const removed = oldImages.filter((url) => !newImages.includes(url));

    doc.blocks = dto.blocks ?? [];
    doc.images = newImages;

    const saved = await doc.save();

    await Promise.all(removed.map((u) => this.safeUnlinkByUrl(u)));

    return {
      blocks: saved.blocks ?? [],
      images: saved.images ?? [],
      updatedAt: saved.updatedAt,
    };
  }

  async updateBlock(blockId: string, dto: UpdateAboutBlockDto) {
    const doc = await this.getOrCreateSingleton();

    const idx = (doc.blocks ?? []).findIndex((b) => b.id === blockId);
    if (idx === -1) throw new NotFoundException('Block not found');

    doc.blocks[idx] = {
      id: dto.id,
      type: dto.type,
      data: dto.data,
    } as any;

    const saved = await doc.save();

    return {
      blocks: saved.blocks ?? [],
      images: saved.images ?? [],
      updatedAt: saved.updatedAt,
    };
  }

  async addImages(images: string[]) {
    const doc = await this.getOrCreateSingleton();

    doc.images = [...(doc.images ?? []), ...(images ?? [])];
    const saved = await doc.save();

    return {
      blocks: saved.blocks ?? [],
      images: saved.images ?? [],
      updatedAt: saved.updatedAt,
    };
  }

  async replaceImageAt(index: number, image: string) {
    const doc = await this.getOrCreateSingleton();

    const arr = doc.images ?? [];
    if (index < 0 || index >= arr.length) {
      throw new NotFoundException('Image index out of range');
    }

    const oldUrl = arr[index];

    arr[index] = image;
    doc.images = arr;

    const saved = await doc.save();

    await this.safeUnlinkByUrl(oldUrl);

    return {
      blocks: saved.blocks ?? [],
      images: saved.images ?? [],
      updatedAt: saved.updatedAt,
    };
  }

  async deleteImageAt(index: number) {
    const doc = await this.getOrCreateSingleton();

    const arr = doc.images ?? [];
    if (index < 0 || index >= arr.length) {
      throw new NotFoundException('Image index out of range');
    }

    const removedUrl = arr[index];

    doc.images = arr.filter((_, i) => i !== index);

    const saved = await doc.save();

    await this.safeUnlinkByUrl(removedUrl);

    return {
      blocks: saved.blocks ?? [],
      images: saved.images ?? [],
      updatedAt: saved.updatedAt,
    };
  }

  async clearImages() {
    const doc = await this.getOrCreateSingleton();

    const urls = doc.images ?? [];
    doc.images = [];

    const saved = await doc.save();

    // ✅ delete all files from disk
    await Promise.all(urls.map((u) => this.safeUnlinkByUrl(u)));

    return {
      blocks: saved.blocks ?? [],
      images: saved.images ?? [],
      updatedAt: saved.updatedAt,
    };
  }
}
