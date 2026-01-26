/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateAboutDto } from './dto/UpdateAbout.dto';
import { UpdateAboutBlockDto } from './dto/UpdateAboutBlock.dto';
import { About, AboutDocument } from '../schemas/About.schema';
import { cloudinary } from '../utils/cloudinary/cloudinary';
import type { Express } from 'express';

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

  async getAbout() {
    const doc = await this.getOrCreateSingleton();
    return {
      blocks: doc.blocks ?? [],
      images: this.toImageUrls(doc.images ?? []),
      updatedAt: doc.updatedAt,
    };
  }

  async replaceAbout(dto: UpdateAboutDto) {
    const doc = await this.getOrCreateSingleton();

    const old = doc.images ?? [];
    const newUrls = dto.images ?? [];

    const keep = old.filter((img) => newUrls.includes(img.url));
    const removed = old.filter((img) => !newUrls.includes(img.url));

    doc.blocks = dto.blocks ?? [];
    doc.images = keep;

    const saved = await doc.save();

    await Promise.all(
      removed.map((img) => this.safeCloudinaryDestroy(img.public_id)),
    );

    return {
      blocks: saved.blocks ?? [],
      images: this.toImageUrls(saved.images ?? []),
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

  async addImages(files: Express.Multer.File[]) {
    const doc = await this.getOrCreateSingleton();

    const uploaded = await Promise.all(
      files.map((f) => this.uploadToCloudinary(f)),
    );
    doc.images = [...(doc.images ?? []), ...uploaded];

    const saved = await doc.save();

    return {
      blocks: saved.blocks ?? [],
      images: this.toImageUrls(saved.images ?? []),
      updatedAt: saved.updatedAt,
    };
  }

  async replaceImageAt(index: number, file: Express.Multer.File) {
    const doc = await this.getOrCreateSingleton();

    const arr = doc.images ?? [];
    if (index < 0 || index >= arr.length)
      throw new NotFoundException('Image index out of range');

    const old = arr[index];

    const uploaded = await this.uploadToCloudinary(file);
    arr[index] = uploaded;
    doc.images = arr;

    const saved = await doc.save();

    await this.safeCloudinaryDestroy(old?.public_id);

    return {
      blocks: saved.blocks ?? [],
      images: this.toImageUrls(saved.images ?? []),
      updatedAt: saved.updatedAt,
    };
  }

  async deleteImageAt(index: number) {
    const doc = await this.getOrCreateSingleton();

    const arr = doc.images ?? [];
    if (index < 0 || index >= arr.length)
      throw new NotFoundException('Image index out of range');

    const removed = arr[index];
    doc.images = arr.filter((_, i) => i !== index);

    const saved = await doc.save();

    await this.safeCloudinaryDestroy(removed?.public_id);

    return {
      blocks: saved.blocks ?? [],
      images: this.toImageUrls(saved.images ?? []),
      updatedAt: saved.updatedAt,
    };
  }

  async clearImages() {
    const doc = await this.getOrCreateSingleton();

    const imgs = doc.images ?? [];
    doc.images = [];

    const saved = await doc.save();

    await Promise.all(imgs.map((x) => this.safeCloudinaryDestroy(x.public_id)));

    return {
      blocks: saved.blocks ?? [],
      images: this.toImageUrls(saved.images ?? []),
      updatedAt: saved.updatedAt,
    };
  }

  private async uploadToCloudinary(file: Express.Multer.File) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const base64 = file.buffer.toString('base64');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const dataUri = `data:${file.mimetype};base64,${base64}`;

    const res = await cloudinary.uploader.upload(dataUri, {
      folder: 'about',
      resource_type: 'image',
    });

    return { url: res.secure_url, public_id: res.public_id };
  }

  private async safeCloudinaryDestroy(public_id?: string | null) {
    if (!public_id) return;
    try {
      await cloudinary.uploader.destroy(public_id, { resource_type: 'image' });
    } catch {
      /* ignore */
    }
  }

  private toImageUrls(images: any[] = []) {
    return images.map((x) => x.url);
  }

  async deleteImageByPublicId(publicId: string) {
    const doc = await this.getOrCreateSingleton();

    const arr = doc.images ?? [];
    const idx = arr.findIndex((x) => x.public_id === publicId);
    if (idx === -1) throw new NotFoundException('Image not found');

    const removed = arr[idx];
    doc.images = arr.filter((_, i) => i !== idx);

    const saved = await doc.save();

    await this.safeCloudinaryDestroy(removed?.public_id);

    return {
      blocks: saved.blocks ?? [],
      images: this.toImageUrls(saved.images ?? []),
      updatedAt: saved.updatedAt,
    };
  }
}
