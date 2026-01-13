import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PermissionsService } from '../permissions/permissions.service';
import { Document } from 'mongoose';
import { Product } from 'src/schemas/Products.schema';
import { Category } from 'src/schemas/Categories.schema';
import { EntityType } from 'src/schemas/Permissions.schema';

// Define document types
export type ProductDocument = Product & Document;
export type CategoryDocument = Category & Document;

// Define unified search item type
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

  async search(
    query: string,
    user: { userId: string; role: string },
    options?: { limit?: number; page?: number },
  ): Promise<{ items: SearchResultItem[]; limit: number; hasMore: boolean, page: number;
  total: number; }> {
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    let productCandidates = await this.productModel
      .find({ productName: new RegExp(escapedQuery, 'i') })
      .exec();

    let categoryCandidates = await this.categoryModel
      .find({ categoryName: new RegExp(escapedQuery, 'i') })
      .exec();

    let allowedProductIds = new Set<string>();
    let allowedCategoryIds = new Set<string>();
    let categoriesMap = new Map<string, CategoryDocument>();

    if (user.role === 'viewer') {
      const permissions = await this.permissionsService.getPermissionsForUser(user.userId);

      allowedProductIds = new Set(
        permissions
          .filter(
            (p) =>
              p.entityType === EntityType.PRODUCT &&
              p.allowed.toString() === user.userId,
          )
          .map((p) => p.entityId.toString()),
      );

      allowedCategoryIds = new Set(
        permissions
          .filter(
            (p) =>
              p.entityType === EntityType.CATEGORY &&
              p.allowed.toString() === user.userId,
          )
          .map((p) => p.entityId.toString()),
      );

      const allCategories = await this.categoryModel.find().exec();
      categoriesMap = new Map(allCategories.map((c) => [c.categoryPath, c]));
    }

    if (user.role === 'viewer') {
      productCandidates = productCandidates.filter((product) => {
        if (!allowedProductIds.has(product._id.toString())) return false;

      
        return this.isCategoryPathReachable(product.productPath, allowedCategoryIds, categoriesMap);
      });

      categoryCandidates = categoryCandidates.filter((cat) =>
        allowedCategoryIds.has(cat._id.toString()),
      );
    }

    const items: SearchResultItem[] = [
      ...productCandidates.map((p) => ({
        type: 'product' as const,
        id: p._id.toString(),
        label: p.productName,
        paths: [p.productPath],
      })),
      ...categoryCandidates.map((c) => ({
        type: 'category' as const,
        id: c._id.toString(),
        label: c.categoryName,
        paths: [c.categoryPath],
      })),
    ];

    items.sort((a, b) => {
      if (a.type === b.type) return a.label.localeCompare(b.label);
      return a.type === 'product' ? -1 : 1; 
    });

const page = options?.page || 1;
const limit = options?.limit || items.length; 

const startIndex = (page - 1) * limit;
const paginatedItems = items.slice(startIndex, startIndex + limit);

const hasMore = startIndex + limit < items.length;

return {
  items: paginatedItems,
  limit,
  page,
  hasMore,
  total: items.length, 
};

  }

  
  private isCategoryPathReachable(
    path: string,
    allowedCategoryIds: Set<string>,
    categoriesMap: Map<string, CategoryDocument>,
  ): boolean {
    const parts = path.split('/').filter(Boolean); 
    let pathSoFar = '';
    for (let i = 0; i < parts.length - 1; i++) {
      pathSoFar += '/' + parts[i];
      const category = categoriesMap.get(pathSoFar);
      if (category && !allowedCategoryIds.has(category._id.toString())) {
        return false; 
      }
    }
    return true; 
  }
}
