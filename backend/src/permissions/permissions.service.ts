/* eslint-disable @typescript-eslint/no-duplicate-type-constituents */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { EntityType, Permission } from 'src/schemas/Permissions.schema';
import { Types } from 'mongoose';
import { CreatePermissionDto } from './dto/createPermission.dto';
import { Product, ProductDocument } from 'src/schemas/Products.schema';
import { Category, CategoryDocument } from 'src/schemas/Categories.schema';
import { UsersService } from 'src/users/users.service';
import { Group } from 'src/schemas/Groups.schema';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Group.name) private groupModel: Model<Group>,
    private usersService: UsersService,
  ) {}

  async getPermissionsForUser(userId: string) {
    const userObjId = new Types.ObjectId(userId);

    const groups = await this.groupModel
      .find({ members: userId })
      .select({ _id: 1 })
      .lean()
      .exec();

    const groupIds = groups.map((g) => new Types.ObjectId(String(g._id)));

    const directPerms = await this.permissionModel
      .find({ allowed: userObjId })
      .lean()
      .exec();

    if (groupIds.length === 0) {
      return directPerms;
    }

    const permsByGroup = await Promise.all(
      groupIds.map((gid) =>
        this.permissionModel
          .find({ allowed: gid })
          .select({ entityType: 1, entityId: 1 })
          .lean()
          .exec(),
      ),
    );

    const makeKey = (p: { entityType: EntityType; entityId: any }) =>
      `${p.entityType}:${String(p.entityId)}`;

    let intersection = new Set(permsByGroup[0].map(makeKey));

    for (let i = 1; i < permsByGroup.length; i++) {
      const currentSet = new Set(permsByGroup[i].map(makeKey));
      intersection = new Set(
        [...intersection].filter((k) => currentSet.has(k)),
      );
    }

    const intersectionPerms = [...intersection].map((k) => {
      const [entityType, entityId] = k.split(':');
      return {
        entityType: entityType as EntityType,
        entityId: new Types.ObjectId(entityId),
      };
    });

    const directKeys = new Set(directPerms.map(makeKey));
    return [
      ...directPerms,
      ...intersectionPerms.filter((p) => !directKeys.has(makeKey(p))),
    ];
  }

  async createPermission(dto: CreatePermissionDto) {
    const { entityType, entityId, allowed, inheritToChildren } = dto;
    const validation = await this.canCreatePermission(
      entityType,
      entityId.toString(),
      allowed.toString(),
    );

    if (!validation.canCreate) {
      throw new HttpException(
        validation.reason || 'לא ניתן ליצור הרשאה זו',
        400,
      );
    }

    const created = await this.permissionModel.create({
      entityType,
      entityId,
      allowed,
    });

    if (entityType !== EntityType.CATEGORY || !inheritToChildren) {
      return created;
    }

    const descendants = await this.getAllCategoryDescendants(entityId);

    await Promise.all(
      descendants.map(async (child) => {
        const exists = await this.permissionModel.exists({
          entityType: child.entityType,
          entityId: child.entityId,
          allowed,
        });

        if (!exists) {
          await this.permissionModel.create({
            entityType: child.entityType,
            entityId: child.entityId,
            allowed,
          });
        }
      }),
    );

    return created;
  }

  async deletePermission(id: string) {
    const permission = await this.permissionModel.findById(id).exec();

    if (!permission) {
      return null;
    }
    const directChildren = await this.getDirectChildrenToDelete(
      permission.entityId.toString(),
    );
    if (directChildren.length > 0) {
      const childIds = directChildren.map((child) => child._id.toString());
      await this.permissionModel
        .deleteMany({
          entityId: { $in: childIds },
          entityType: EntityType.CATEGORY,
        })
        .exec();
    }
    return this.permissionModel.findByIdAndDelete(id).exec();
  }

  async getPermissionsByEntityType(entityId: string) {
    return await this.permissionModel.find({ entityId: entityId }).exec();
  }

  async getPermissionsForAllowedId(allowedId: string) {
    return await this.permissionModel
      .find({ allowed: new Types.ObjectId(allowedId) })
      .exec();
  }

  async getAllowedUsersForEntity(
    entityId: string,
    entityType: EntityType,
  ): Promise<string[]> {
    const allowedUsers = await this.permissionModel.aggregate([
      {
        $match: { entityId: new mongoose.Types.ObjectId(entityId), entityType },
      },
      { $group: { _id: '$allowed' } },
      { $project: { _id: 1 } },
    ]);
    return allowedUsers.map((u) => u._id.toString());
  }

  async assignPermissionsForNewEntity(
    entity: ProductDocument | CategoryDocument,
  ) {
    const isProduct = 'productPath' in entity;
    const path = isProduct ? entity.productPath : entity.categoryPath;

    const pathAsString = Array.isArray(path) ? path[0] : path;
    const rawParts = pathAsString.split('/').filter(Boolean);
    const normalizedParts =
      rawParts[0] === 'categories' ? rawParts.slice(1) : rawParts;

    if (!isProduct && normalizedParts.length === 1) {
      const allUsers = await this.usersService.getAllUserIds();

      const permissions = allUsers.map((userId) => ({
        entityType: EntityType.CATEGORY,
        entityId: entity._id,
        allowed: userId,
      }));

      if (permissions.length) {
        await this.permissionModel.insertMany(permissions);
      }
      return;
    }

    const parentName = normalizedParts[normalizedParts.length - 2];
    if (!parentName) return;

    const parentPath = '/categories/' + normalizedParts.slice(0, -1).join('/');
    const parentCategory = await this.categoryModel
      .findOne({ categoryPath: parentPath })
      .select('_id')
      .lean();

    if (!parentCategory) return;

    const allowedUsers = await this.getAllowedUsersForEntity(
      parentCategory._id.toString(),
      EntityType.CATEGORY,
    );

    const permissions = allowedUsers.map((userId) => ({
      entityType: isProduct ? EntityType.PRODUCT : EntityType.CATEGORY,
      entityId: entity._id,
      allowed: userId,
    }));

    if (permissions.length) {
      await this.permissionModel.insertMany(permissions);
    }
  }

  async getDirectChildrenToDelete(categoryId: string) {
    if (!categoryId) return [];
    const category = await this.categoryModel.findById(categoryId);
    if (!category) return [];
    let cleanPath = category.categoryPath;
    if (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.substring(1);
    }
    const fullPath = cleanPath.startsWith('categories/')
      ? `/${cleanPath}`
      : `/categories/${cleanPath}`;

    const allChildren = await this.categoryModel.find({
      categoryPath: new RegExp(
        `^${fullPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/`,
      ),
    });

    const directChildren = allChildren.filter((cat) => {
      const remainingPath = cat.categoryPath.substring(fullPath.length + 1);
      const slashCount = (remainingPath.match(/\//g) || []).length;
      return slashCount === 0;
    });

    return directChildren;
  }
  async getBlockedItemsForGroup(groupId: string) {
    const permissions = await this.permissionModel
      .find({ allowed: new Types.ObjectId(groupId) })
      .lean()
      .exec();
    const allowedProductIds = new Set(
      permissions
        .filter((p) => String(p.entityType).toLowerCase() === 'product')
        .map((p) => String(p.entityId)),
    );
    const allowedCategoryIds = new Set(
      permissions
        .filter((p) => String(p.entityType).toLowerCase() === 'category')
        .map((p) => String(p.entityId)),
    );
    const [allProducts, allCategories] = await Promise.all([
      this.productModel.find().lean().exec(),
      this.categoryModel.find().lean().exec(),
    ]);
    const existingProductIds = new Set(allProducts.map((p) => String(p._id)));
    const existingCategoryIds = new Set(
      allCategories.map((c) => String(c._id)),
    );
    const orphanPermissions = permissions.filter((p) => {
      const entityId = String(p.entityId);
      const entityType = String(p.entityType).toLowerCase();
      if (entityType === 'product') {
        return !existingProductIds.has(entityId);
      } else if (entityType === 'category') {
        return !existingCategoryIds.has(entityId);
      }
      return false;
    });
    if (orphanPermissions.length > 0) {
      await this.permissionModel.deleteMany({
        _id: { $in: orphanPermissions.map((p) => p._id) },
      });
    }
    const validAllowedProductIds = new Set(
      Array.from(allowedProductIds).filter((id) => existingProductIds.has(id)),
    );
    const validAllowedCategoryIds = new Set(
      Array.from(allowedCategoryIds).filter((id) =>
        existingCategoryIds.has(id),
      ),
    );
    const pathToString = (path: string | string[] | Array<string>): string => {
      if (!path) return '';
      if (Array.isArray(path)) {
        return path.length > 0 ? path[0] : '';
      }
      return path;
    };
    const blockedCategoryPaths = allCategories
      .filter((c) => !validAllowedCategoryIds.has(String(c._id)))
      .map((c) => pathToString(c.categoryPath));
    const isUnderBlockedCategory = (itemPath: string | string[]): boolean => {
      const pathStr = pathToString(itemPath);
      if (!pathStr) return false;

      return blockedCategoryPaths.some((blockedPath) => {
        if (!blockedPath) return false;
        return (
          pathStr.startsWith(blockedPath + '/') ||
          pathStr.startsWith(blockedPath)
        );
      });
    };
    const blockedProducts = allProducts
      .filter(
        (p) =>
          !validAllowedProductIds.has(String(p._id)) ||
          isUnderBlockedCategory(p.productPath),
      )
      .map((p) => ({
        id: String(p._id),
        name: p.productName,
        type: 'product' as const,
        image: p.productImages?.[0] || null,
        groupId,
      }));
    const blockedCategories = allCategories
      .filter(
        (c) =>
          !validAllowedCategoryIds.has(String(c._id)) ||
          isUnderBlockedCategory(c.categoryPath),
      )
      .map((c) => ({
        id: String(c._id),
        name: c.categoryName,
        type: 'category' as const,
        image: c.categoryImage || null,
        groupId,
      }));
    const availableProducts = allProducts
      .filter(
        (p) =>
          validAllowedProductIds.has(String(p._id)) &&
          !isUnderBlockedCategory(p.productPath),
      )
      .map((p) => ({
        id: String(p._id),
        name: p.productName,
        type: 'product' as const,
        image: p.productImages?.[0] || null,
        groupId,
      }));
    const availableCategories = allCategories
      .filter(
        (c) =>
          validAllowedCategoryIds.has(String(c._id)) &&
          !isUnderBlockedCategory(c.categoryPath),
      )
      .map((c) => ({
        id: String(c._id),
        name: c.categoryName,
        type: 'category' as const,
        image: c.categoryImage || null,
        groupId,
      }));
    const validPermissions = permissions.filter((p) => {
      const entityId = String(p.entityId);
      const entityType = String(p.entityType).toLowerCase();
      if (entityType === 'product') {
        return existingProductIds.has(entityId);
      } else if (entityType === 'category') {
        return existingCategoryIds.has(entityId);
      }
      return false;
    });
    const permissionIdByKey = validPermissions.reduce(
      (acc, p) => {
        const typeStr = String(p.entityType).toLowerCase();
        const key = `${typeStr}:${String(p.entityId)}`;
        acc[key] = String(p._id);
        return acc;
      },
      {} as Record<string, string>,
    );
    return {
      blocked: [...blockedProducts, ...blockedCategories],
      available: [...availableProducts, ...availableCategories],
      permissionIdByKey,
    };
  }
  async canCreatePermission(
    entityType: EntityType,
    entityId: string,
    allowedId: string,
  ): Promise<{ canCreate: boolean; reason?: string }> {
    if (entityType === EntityType.CATEGORY) {
      const category = await this.categoryModel.findById(entityId).lean();
      if (!category) {
        return { canCreate: false, reason: 'הקטגוריה לא נמצאה' };
      }
      const pathAsString = Array.isArray(category.categoryPath)
        ? category.categoryPath[0]
        : category.categoryPath;
      const pathParts = pathAsString.split('/').filter(Boolean);
      const normalizedParts =
        pathParts[0] === 'categories' ? pathParts.slice(1) : pathParts;
      const categoriesToCheck: string[] = [];
      for (let i = 1; i < normalizedParts.length; i++) {
        const parentPath =
          '/categories/' + normalizedParts.slice(0, i).join('/');
        categoriesToCheck.push(parentPath);
      }
      if (categoriesToCheck.length > 0) {
        const parentCategories = await this.categoryModel
          .find({ categoryPath: { $in: categoriesToCheck } })
          .select('_id categoryName categoryPath')
          .lean();
        for (const parentCategory of parentCategories) {
          const hasPermission = await this.permissionModel.findOne({
            entityType: EntityType.CATEGORY,
            entityId: parentCategory._id,
            allowed: new mongoose.Types.ObjectId(allowedId),
          });
          if (!hasPermission) {
            return {
              canCreate: false,
              reason: `לא ניתן לשחרר פריט זה כי קטגורית האב "${parentCategory.categoryName}" חסומה`,
            };
          }
        }
      }
      return { canCreate: true };
    }
    if (entityType === EntityType.PRODUCT) {
      const product = await this.productModel.findById(entityId).lean();
      if (!product) {
        return { canCreate: false, reason: 'המוצר לא נמצא' };
      }
      const pathAsString = Array.isArray(product.productPath)
        ? product.productPath[0]
        : product.productPath;

      const pathParts = pathAsString.split('/').filter(Boolean);
      const categoriesToCheck: string[] = [];
      for (let i = 1; i < pathParts.length; i++) {
        const parentPath = '/categories/' + pathParts.slice(1, i + 1).join('/');
        categoriesToCheck.push(parentPath);
      }

      if (categoriesToCheck.length > 0) {
        const parentCategories = await this.categoryModel
          .find({ categoryPath: { $in: categoriesToCheck } })
          .select('_id categoryName categoryPath')
          .lean();
        for (const parentCategory of parentCategories) {
          const hasPermission = await this.permissionModel.findOne({
            entityType: EntityType.CATEGORY,
            entityId: parentCategory._id,
            allowed: new mongoose.Types.ObjectId(allowedId),
          });
          if (!hasPermission) {
            return {
              canCreate: false,
              reason: `לא ניתן לשחרר פריט זה כי קטגורית האב "${parentCategory.categoryName}" חסומה`,
            };
          }
        }
      }
    }
    return { canCreate: true };
  }
  async getAllCategoryDescendants(
    categoryId: string,
  ): Promise<{ entityType: EntityType; entityId: string }[]> {
    const category = await this.categoryModel
      .findById(categoryId)
      .select('categoryPath')
      .lean();

    if (!category || !category.categoryPath) {
      return [];
    }

    const basePath = category.categoryPath.replace(/\/$/, '');

    const categories = await this.categoryModel
      .find({
        categoryPath: { $regex: `^${basePath}/` },
      })
      .select('_id')
      .lean();

    const products = await this.productModel
      .find({
        productPath: {
          $elemMatch: {
            $regex: `^${basePath}/`,
          },
        },
      })
      .select('_id')
      .lean();

    return [
      ...categories.map((c) => ({
        entityType: EntityType.CATEGORY,
        entityId: c._id.toString(),
      })),
      ...products.map((p) => ({
        entityType: EntityType.PRODUCT,
        entityId: p._id.toString(),
      })),
    ];
  }
}
