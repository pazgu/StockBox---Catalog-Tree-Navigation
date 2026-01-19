/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PermissionsService } from '../permissions/permissions.service';
import { Document } from 'mongoose';
import { Product } from 'src/schemas/Products.schema';
import { Category } from 'src/schemas/Categories.schema';
import { EntityType } from 'src/schemas/Permissions.schema';

export type ProductDocument = Product & Document;
export type CategoryDocument = Category & Document;

export type SearchResultItem = {
  type: 'product' | 'category';
  id: string;
  label: string;
  paths: string[];
};

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    private readonly permissionsService: PermissionsService,
  ) {}

  private async getAllowedPaths(userId: string): Promise<{
    allowedCategoryPaths: string[];
    allowedProductPaths: string[];
  }> {
    const permissions =
      await this.permissionsService.getPermissionsForUser(userId);

    const categoryPermissionIds = permissions
      .filter((p) => p.entityType === EntityType.CATEGORY)
      .map((p) => p.entityId);

    const productPermissionIds = permissions
      .filter((p) => p.entityType === EntityType.PRODUCT)
      .map((p) => p.entityId);

    const categories = await this.categoryModel
      .find({ _id: { $in: categoryPermissionIds } })
      .select({ categoryPath: 1 })
      .lean()
      .exec();

    const sortedPaths = categories
      .map((c) => c.categoryPath)
      .sort((a, b) => a.split('/').length - b.split('/').length);

    const allowedCategoryPaths = new Set<string>();
    for (const path of sortedPaths) {
      const parts = path.split('/').filter(Boolean);
      let valid = true;
      let current = `/${parts[0]}`;
      for (let i = 1; i < parts.length - 1; i++) {
        current += '/' + parts[i];
        if (!allowedCategoryPaths.has(current)) {
          valid = false;
          break;
        }
      }
      if (valid) allowedCategoryPaths.add(path);
    }

    const allowedProducts = await this.productModel
      .find({ _id: { $in: productPermissionIds } })
      .select({ productPath: 1 })
      .lean()
      .exec();

    const allowedProductPaths = allowedProducts.map((p) => p.productPath);

    return {
      allowedCategoryPaths: Array.from(allowedCategoryPaths),
      allowedProductPaths,
    };
  }

  async searchEntities(
    userId: string,
    searchTerm: string,
    page = 1,
    limit = 20,
  ) {
    const { allowedCategoryPaths, allowedProductPaths } =
      await this.getAllowedPaths(userId);

    if (!allowedCategoryPaths.length && !allowedProductPaths.length) {
      return { items: [], total: 0, page, limit, hasMore: false };
    }

    const skip = (page - 1) * limit;

    const pipeline: any[] = [
      {
        $match: {
          categoryPath: { $in: allowedCategoryPaths },
          ...(searchTerm ? { $text: { $search: searchTerm } } : {}),
        },
      },
      {
        $addFields: {
          type: 'category',
          label: '$categoryName',
          path: '$categoryPath',
          score: searchTerm ? { $meta: 'textScore' } : 0,
        },
      },
      {
        $project: { _id: 1, type: 1, label: 1, path: 1, score: 1 },
      },

      {
        $unionWith: {
          coll: 'products',
          pipeline: [
            {
              $match: {
                productPath: { $in: allowedProductPaths },
                ...(searchTerm ? { $text: { $search: searchTerm } } : {}),
              },
            },
            {
              $addFields: {
                type: 'product',
                label: '$productName',
                path: '$productPath',
                score: searchTerm ? { $meta: 'textScore' } : 0,
              },
            },
            {
              $project: { _id: 1, type: 1, label: 1, path: 1, score: 1 },
            },
          ],
        },
      },

      {
        $sort: {
          score: -1, // higher textScore first
          type: 1, // products before categories if tie
          label: 1, // alphabetical fallback
        },
      },

      { $skip: skip },
      { $limit: limit + 1 }, // fetch one extra to check hasMore
    ];

    const results = await this.categoryModel.aggregate(pipeline);

    const hasMore = results.length > limit;
    if (hasMore) results.pop();

    return {
      items: results.map((r) => ({
        type: r.type,
        id: r._id.toString(),
        label: r.label,
        paths: [r.path],
      })),
      total: results.length,
      page,
      limit,
      hasMore,
    };
  }
}
