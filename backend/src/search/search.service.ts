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
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private readonly categoryModel: Model<CategoryDocument>,
    private readonly permissionsService: PermissionsService,
  ) {}


private async getAllowedPaths(userId: string): Promise<{
  allowedCategoryPaths: string[];
  allowedProductIds: Set<string>;
}> {
  const permissions = await this.permissionsService.getPermissionsForUser(userId);

  const categoryPermissionIds = permissions
    .filter(p => p.entityType === EntityType.CATEGORY)
    .map(p => p.entityId);

  const productPermissionIds = permissions
    .filter(p => p.entityType === EntityType.PRODUCT)
    .map(p => p.entityId);

  const categories = await this.categoryModel
    .find({ _id: { $in: categoryPermissionIds } })
    .select({ categoryPath: 1 })
    .lean()
    .exec();

  const sortedPaths = categories
    .map(c => c.categoryPath)
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

  return {
    allowedCategoryPaths: Array.from(allowedCategoryPaths),
    allowedProductIds: new Set(productPermissionIds.map(id => id.toString())),
  };
}

async searchEntities(
  userId: string,
  searchTerm: string,
  page = 1,
  limit = 10,
) {
  const { allowedCategoryPaths, allowedProductIds } =
    await this.getAllowedPaths(userId);

  if (!allowedCategoryPaths.length) {
    return { items: [], total: 0, page, limit, hasMore: false };
  }

  const categoryQuery: any = {
    categoryPath: { $in: allowedCategoryPaths },
  };

  if (searchTerm) {
    categoryQuery.categoryName = { $regex: searchTerm, $options: 'i' };
  }

  let productQuery: any | null = null;

  if (allowedProductIds.size > 0) {
    productQuery = {
      $and: [
        {
          productPath: {
            $regex: `^(${allowedCategoryPaths.join('|')})(/|$)`,
          },
        },
        { _id: { $in: Array.from(allowedProductIds) } },
      ],
    };

    if (searchTerm) {
      productQuery.productName = { $regex: searchTerm, $options: 'i' };
    }
  }

  const [categories, products] = await Promise.all([
    this.categoryModel
      .find(categoryQuery)
      .sort({ categoryName: 1 })
      .lean(),

    productQuery
      ? this.productModel
          .find(productQuery)
          .sort({ productName: 1 })
          .lean()
      : Promise.resolve([]),
  ]);

 
  const items = [
    ...categories.map(c => ({
      type: 'category' as const,
      id: c._id.toString(),
      label: c.categoryName,
      paths: [c.categoryPath],
    })),
    ...products.map(p => ({
      type: 'product' as const,
      id: p._id.toString(),
      label: p.productName,
      paths: [p.productPath],
    })),
  ];


  const total = items.length;
  const skip = (page - 1) * limit;

  return {
    items: items.slice(skip, skip + limit),
    total,
    page,
    limit,
    hasMore: skip + limit < total,
  };
}


}
