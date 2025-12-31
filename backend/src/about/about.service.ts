/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateAboutDto } from './dto/UpdateAbout.dto';
import { UpdateAboutBlockDto } from './dto/UpdateAboutBlock.dto';
import { About, AboutDocument } from './schemas/About.schema';

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
      images: doc.images ?? [],
      updatedAt: doc.updatedAt,
    };
  }

  async replaceAbout(dto: UpdateAboutDto) {
    const updated = await this.aboutModel
      .findByIdAndUpdate(
        ABOUT_SINGLETON_ID,
        {
          $set: {
            blocks: dto.blocks ?? [],
            images: dto.images ?? [],
          },
        },
        { new: true, upsert: true },
      )
      .exec();

    return {
      blocks: updated.blocks ?? [],
      images: updated.images ?? [],
      updatedAt: updated.updatedAt,
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
}
