/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PermissionsService } from '../permissions/permissions.service';
import { Document } from 'mongoose';
import { Product } from 'src/schemas/Products.schema';
import { Category } from 'src/schemas/Categories.schema';
import { EntityType } from 'src/schemas/Permissions.schema';
import { Group } from 'src/schemas/Groups.schema';

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
    @InjectModel(Group.name)
    private readonly groupModel: Model<Group>,
    private readonly permissionsService: PermissionsService,
  ) {}

  private async getAllowedPaths(
    userId: string,
    userRole?: string,
  ): Promise<{
    allowedCategoryPaths: string[];
    allowedProductPaths: string[];
    allowedProductIds: string[];
  }> {
    if (userRole === 'editor') {
      const allCategories = await this.categoryModel
        .find({})
        .select({ categoryPath: 1 })
        .lean();

      const allProducts = await this.productModel
        .find({})
        .select({ productPath: 1 })
        .lean();

      return {
        allowedCategoryPaths: allCategories.map((c) => c.categoryPath),
        allowedProductPaths: allProducts.flatMap((p) => p.productPath),
        allowedProductIds: allProducts.map((p) => p._id.toString()),
      };
    }

    const userObjectId = new Types.ObjectId(userId);

    const userGroups = await this.groupModel
      .find({ members: userObjectId })
      .select('_id')
      .lean();

    const userGroupIds = userGroups.map((g) => g._id.toString());
    const permissions = await this.permissionsService.getPermissionsForUser(
      userId,
      userGroupIds,
    );

    const categoryGroupPermissions = new Map<string, Set<string>>();
    const categoryUserPermissions = new Set<string>();
    const productGroupPermissions = new Map<string, Set<string>>();
    const productUserPermissions = new Set<string>();

    for (const p of permissions) {
      const entityId = p.entityId.toString();
      const allowedId = p.allowed.toString();

      if (p.entityType === EntityType.CATEGORY) {
        if (userGroupIds.includes(allowedId)) {
          if (!categoryGroupPermissions.has(entityId))
            categoryGroupPermissions.set(entityId, new Set());
          categoryGroupPermissions.get(entityId)!.add(allowedId);
        } else if (allowedId === userId) categoryUserPermissions.add(entityId);
      }

      if (p.entityType === EntityType.PRODUCT) {
        if (userGroupIds.includes(allowedId)) {
          if (!productGroupPermissions.has(entityId))
            productGroupPermissions.set(entityId, new Set());
          productGroupPermissions.get(entityId)!.add(allowedId);
        } else if (allowedId === userId) productUserPermissions.add(entityId);
      }
    }

    const allowedCategoryIds =
      userGroupIds.length > 0
        ? Array.from(categoryGroupPermissions.entries())
            .filter(([_, groupSet]) =>
              userGroupIds.every((gid) => groupSet.has(gid)),
            )
            .map(([categoryId]) => categoryId)
        : Array.from(categoryUserPermissions);

    const allowedCategoryObjectIds = allowedCategoryIds.map(
      (id) => new Types.ObjectId(id),
    );

    const categories = await this.categoryModel
      .find({ _id: { $in: allowedCategoryObjectIds } })
      .select({ categoryPath: 1 })
      .lean();

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

    const allowedProductIds =
      userGroupIds.length > 0
        ? Array.from(productGroupPermissions.entries())
            .filter(([_, groupSet]) =>
              userGroupIds.every((gid) => groupSet.has(gid)),
            )
            .map(([productId]) => productId)
        : Array.from(productUserPermissions);

    const allowedProductObjectIds = allowedProductIds.map(
      (id) => new Types.ObjectId(id),
    );

    const products = await this.productModel
      .find({ _id: { $in: allowedProductObjectIds } })
      .select({ productPath: 1 })
      .lean();

    const allowedProductPaths = products.flatMap((p) =>
      p.productPath.filter((pp) => {
        const parts = pp.split('/').filter(Boolean);
        let current = `/${parts[0]}`;
        for (let i = 1; i < parts.length - 1; i++) {
          current += '/' + parts[i];
          if (!allowedCategoryPaths.has(current)) return false;
        }
        return true;
      }),
    );
    return {
      allowedCategoryPaths: Array.from(allowedCategoryPaths),
      allowedProductPaths,
      allowedProductIds,
    };
  }

  async searchEntities(
    userId: string,
    searchTerm: string,
    page = 1,
    limit = 20,
    userRole?: string,
  ) {
    const { allowedCategoryPaths, allowedProductPaths, allowedProductIds } =
      await this.getAllowedPaths(userId, userRole);

    if (!allowedCategoryPaths.length && !allowedProductIds.length) {
      return { items: [], total: 0, page, limit, hasMore: false };
    }

    const allowedProductObjectIds = allowedProductIds.map(
      (id) => new Types.ObjectId(id),
    );

    const skip = (page - 1) * limit;

    const tokens = searchTerm.trim().split(/\s+/).filter(Boolean);
    const isSpecificSearch = tokens.length > 1;

    const fuzzyRegex = tokens.join('.*');

    const pipeline: any[] = [
      {
        $match: {
          ...(searchTerm ? { $text: { $search: searchTerm } } : {}),
          ...(isSpecificSearch
            ? {
                categoryName: {
                  $regex: fuzzyRegex,
                  $options: 'i',
                },
              }
            : {}),
          categoryPath: { $in: allowedCategoryPaths },
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
                ...(searchTerm ? { $text: { $search: searchTerm } } : {}),
              },
            },

            ...(isSpecificSearch
              ? [
                  {
                    $match: {
                      productName: {
                        $regex: isSpecificSearch ? fuzzyRegex : tokens[0],
                        $options: 'i',
                      },
                    },
                  },
                ]
              : []),

            {
              $match: {
                _id: { $in: allowedProductObjectIds },
              },
            },

            { $unwind: '$productPath' },
            {
              $match: {
                productPath: { $in: allowedProductPaths },
              },
            },

            {
              $group: {
                _id: '$_id',
                label: { $first: '$productName' },
                score: { $max: searchTerm ? { $meta: 'textScore' } : 0 },
                paths: { $addToSet: '$productPath' },
              },
            },

            {
              $addFields: {
                type: 'product',
                path: '$paths',
              },
            },

            {
              $project: { _id: 1, type: 1, label: 1, path: 1, score: 1 },
            },
          ],
        },
      },

      { $sort: { score: -1, type: 1, label: 1 } },
      { $skip: skip },
      { $limit: limit + 1 },
    ];

    const results = await this.categoryModel.aggregate(pipeline);

    const hasMore = results.length > limit;
    if (hasMore) results.pop();

    return {
      items: results.map((r) => ({
        type: r.type,
        id: r._id.toString(),
        label: r.label,
        paths: Array.isArray(r.path) ? r.path : [r.path],
      })),
      total: results.length,
      page,
      limit,
      hasMore,
    };
  }
}
