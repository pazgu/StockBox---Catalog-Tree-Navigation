/* eslint-disable @typescript-eslint/restrict-template-expressions */
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
import { AnyBulkWriteOperation, Filter, UpdateFilter } from 'mongodb';
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

  async getPermissionsForUser(userId: string, userGroupIds?: string[]) {
    console.log(
      'Getting permissions for user:',
      userId,
      'with groups:',
      userGroupIds,
    );
    const allowedIds = [
      new Types.ObjectId(userId),
      ...(userGroupIds || []).map((id) => new Types.ObjectId(id)),
    ];
    console.log('Allowed IDs:', allowedIds);
    return await this.permissionModel
      .find({
        allowed: { $in: allowedIds },
      })
      .exec();
  }

  async createPermission(dto: CreatePermissionDto) {
    const { entityType, entityId, allowed, inheritToChildren } = dto;

    const existingPermission = await this.permissionModel.findOne({
      entityType,
      entityId,
      allowed,
    });

    if (existingPermission) {
      return existingPermission;
    }

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

    if (entityType === EntityType.CATEGORY) {
      await this.categoryModel.updateOne(
        { _id: entityId },
        { $set: { permissionsInheritedToChildren: !!inheritToChildren } },
      );
    }

    if (entityType !== EntityType.CATEGORY || !inheritToChildren) {
      return created;
    }

    const descendants = await this.getAllCategoryDescendants(entityId);
    if (!descendants.length) return created;

    const bulkOps: AnyBulkWriteOperation<Permission>[] = descendants.map(
      (child) => ({
        updateOne: {
          filter: {
            entityType: child.entityType,
            entityId: new Types.ObjectId(child.entityId),
            allowed: new Types.ObjectId(allowed),
          },
          update: {
            $setOnInsert: {
              entityType: child.entityType,
              entityId: new Types.ObjectId(child.entityId),
              allowed: new Types.ObjectId(allowed),
            },
          },
          upsert: true,
        },
      }),
    );

    await this.permissionModel.bulkWrite(bulkOps);

    return created;
  }

  async createPermissionsBatch(dtos: CreatePermissionDto[]) {
    const existingPermissions = await this.permissionModel.find({
      $or: dtos.map((dto) => ({
        entityType: dto.entityType,
        entityId: dto.entityId,
        allowed: dto.allowed,
      })),
    });
    const existingKeys = new Set(
      existingPermissions.map(
        (p) => `${p.entityType}:${p.entityId}:${p.allowed}`,
      ),
    );
    const dtosToProcess = dtos.filter((dto) => {
      const key = `${dto.entityType}:${dto.entityId}:${dto.allowed}`;
      return !existingKeys.has(key);
    });
    const validationPromises = dtosToProcess.map(async (dto) => {
      const validation = await this.canCreatePermission(
        dto.entityType,
        dto.entityId.toString(),
        dto.allowed.toString(),
      );
      return { dto, validation };
    });
    const validationResults = await Promise.all(validationPromises);
    const validDtos = validationResults
      .filter((r) => r.validation.canCreate)
      .map((r) => r.dto);
    const failedDtos = validationResults
      .filter((r) => !r.validation.canCreate)
      .map((r) => ({
        dto: r.dto,
        reason: r.validation.reason || 'לא ניתן ליצור הרשאה זו',
      }));
    let createdPermissions: any[] = [];
    if (validDtos.length > 0) {
      createdPermissions = await this.permissionModel.insertMany(
        validDtos.map((dto) => ({
          entityType: dto.entityType,
          entityId: dto.entityId,
          allowed: dto.allowed,
        })),
        { ordered: false },
      );
      for (const dto of validDtos) {
        if (dto.entityType === EntityType.CATEGORY && dto.inheritToChildren) {
          const descendants = await this.getAllCategoryDescendants(
            dto.entityId,
          );
          await Promise.all(
            descendants.map(async (child) => {
              const exists = await this.permissionModel.exists({
                entityType: child.entityType,
                entityId: child.entityId,
                allowed: dto.allowed,
              });
              if (!exists) {
                await this.permissionModel.create({
                  entityType: child.entityType,
                  entityId: child.entityId,
                  allowed: dto.allowed,
                });
              }
            }),
          );
        }
      }
    }
    return {
      success: true,
      total: dtos.length,
      created: createdPermissions.length,
      existing: existingPermissions.length,
      failed: failedDtos.length,
      details: {
        created: createdPermissions.map((p, i) => ({
          dto: validDtos[i],
          permission: p,
        })),
        existing: existingPermissions.map((p) => {
          const matchingDto = dtos.find(
            (dto) =>
              dto.entityType === p.entityType &&
              String(dto.entityId) === String(p.entityId) &&
              String(dto.allowed) === String(p.allowed),
          );
          return { dto: matchingDto, permission: p };
        }),
        failed: failedDtos,
      },
    };
  }
  async deletePermissionsBatch(ids: string[]) {
    const permissions = await this.permissionModel
      .find({
        _id: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) },
      })
      .exec();
    const foundIds = new Set(permissions.map((p) => p._id.toString()));
    const notFoundIds = ids.filter((id) => !foundIds.has(id));
    const categoryPermissions = permissions.filter(
      (p) => p.entityType === EntityType.CATEGORY,
    );
    const descendantsPromises = categoryPermissions.map(async (permission) => {
      const descendants = await this.getAllCategoryDescendants(
        permission.entityId.toString(),
      );
      return { permission, descendants };
    });

    const descendantsResults = await Promise.all(descendantsPromises);
    const idsToDelete = new Set<string>(
      permissions.map((p) => p._id.toString()),
    );

    for (const result of descendantsResults) {
      if (result.descendants.length > 0) {
        const descendantPermissions = await this.permissionModel
          .find({
            $or: result.descendants.map((child) => ({
              entityType: child.entityType,
              entityId: new mongoose.Types.ObjectId(child.entityId),
              allowed: result.permission.allowed,
            })),
          })
          .select('_id')
          .exec();
        descendantPermissions.forEach((p) => idsToDelete.add(p._id.toString()));
      }
    }
    const deleteResult = await this.permissionModel
      .deleteMany({
        _id: {
          $in: Array.from(idsToDelete).map(
            (id) => new mongoose.Types.ObjectId(id),
          ),
        },
      })
      .exec();
    return {
      success: true,
      total: ids.length,
      deleted: deleteResult.deletedCount,
      notFound: notFoundIds.length,
      failed: 0,
      details: {
        deleted: Array.from(idsToDelete),
        notFound: notFoundIds,
        failed: [],
      },
    };
  }

  async deletePermission(id: string) {
    const permission = await this.permissionModel.findById(id).exec();

    if (!permission) {
      return null;
    }

    if (permission.entityType === EntityType.CATEGORY) {
      const descendants = await this.getAllCategoryDescendants(
        permission.entityId.toString(),
      );

      if (descendants.length > 0) {
        await this.permissionModel
          .deleteMany({
            $or: descendants.map((child) => ({
              entityType: child.entityType,
              entityId: new mongoose.Types.ObjectId(child.entityId),
              allowed: permission.allowed,
            })),
          })
          .exec();
      }
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
  async updatePermissionsOnMove(
    entityId: string,
    entityType: EntityType,
    newParentPath: string,
  ): Promise<void> {
    const parentCategory = await this.categoryModel
      .findOne({ categoryPath: newParentPath })
      .select('_id')
      .lean();

    if (!parentCategory) {
      console.warn(`Parent category not found for path: ${newParentPath}`);
      return;
    }
    const parentAllowedUsers = await this.getAllowedUsersForEntity(
      parentCategory._id.toString(),
      EntityType.CATEGORY,
    );
    await this.permissionModel.deleteMany({
      entityType,
      entityId: new mongoose.Types.ObjectId(entityId),
    });
    const newPermissions = parentAllowedUsers.map((userId) => ({
      entityType,
      entityId: new mongoose.Types.ObjectId(entityId),
      allowed: new mongoose.Types.ObjectId(userId),
    }));

    if (newPermissions.length > 0) {
      await this.permissionModel.insertMany(newPermissions);
    }
    if (entityType === EntityType.CATEGORY) {
      const descendants = await this.getAllCategoryDescendants(entityId);

      for (const descendant of descendants) {
        await this.permissionModel.deleteMany({
          entityType: descendant.entityType,
          entityId: new mongoose.Types.ObjectId(descendant.entityId),
        });
        const descendantPermissions = parentAllowedUsers.map((userId) => ({
          entityType: descendant.entityType,
          entityId: new mongoose.Types.ObjectId(descendant.entityId),
          allowed: new mongoose.Types.ObjectId(userId),
        }));
        if (descendantPermissions.length > 0) {
          await this.permissionModel.insertMany(descendantPermissions);
        }
      }
    }
  }
  async assignPermissionsOnDuplicate(
    productId: string,
    additionalCategoryPaths: string[],
  ): Promise<void> {
    for (const categoryPath of additionalCategoryPaths) {
      const parentCategory = await this.categoryModel
        .findOne({ categoryPath })
        .select('_id')
        .lean();
      if (!parentCategory) {
        console.warn(`Category not found for path: ${categoryPath}`);
        continue;
      }
      const allowedUsers = await this.getAllowedUsersForEntity(
        parentCategory._id.toString(),
        EntityType.CATEGORY,
      );
      const existingPermissions = await this.permissionModel
        .find({
          entityType: EntityType.PRODUCT,
          entityId: new mongoose.Types.ObjectId(productId),
        })
        .lean();
      const existingAllowedIds = new Set(
        existingPermissions.map((p) => p.allowed.toString()),
      );
      const newPermissions = allowedUsers
        .filter((userId) => !existingAllowedIds.has(userId))
        .map((userId) => ({
          entityType: EntityType.PRODUCT,
          entityId: new mongoose.Types.ObjectId(productId),
          allowed: new mongoose.Types.ObjectId(userId),
        }));
      if (newPermissions.length > 0) {
        await this.permissionModel.insertMany(newPermissions);
      }
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

  async syncCategoryPermissionsToChildren(categoryId: string) {
    const categoryObjectId = new Types.ObjectId(categoryId);

    const parentPermissions = await this.permissionModel
      .find({
        entityType: EntityType.CATEGORY,
        entityId: categoryObjectId,
      })
      .lean();

    const parentAllowedIds = parentPermissions.map((p) => p.allowed.toString());

    const descendants = await this.getAllCategoryDescendants(categoryId);

    if (descendants.length === 0) {
      await this.categoryModel.updateOne(
        { _id: categoryObjectId },
        { $set: { permissionsInheritedToChildren: true } },
      );

      return { success: true, message: 'אין צאצאים לעדכון' };
    }

    const descendantEntityIds = descendants.map(
      (d) => new Types.ObjectId(d.entityId),
    );

    const allDescendantPermissions = await this.permissionModel
      .find({
        entityId: { $in: descendantEntityIds },
        entityType: { $in: [EntityType.CATEGORY, EntityType.PRODUCT] },
      })
      .lean();

    const permissionsByEntity = new Map<string, string[]>();

    for (const perm of allDescendantPermissions) {
      const key = perm.entityId.toString();
      if (!permissionsByEntity.has(key)) {
        permissionsByEntity.set(key, []);
      }
      permissionsByEntity.get(key)!.push(perm.allowed.toString());
    }

    const bulkOps: AnyBulkWriteOperation<Permission>[] = [];

    for (const child of descendants) {
      const childEntityId = new Types.ObjectId(child.entityId);
      const childAllowed =
        permissionsByEntity.get(childEntityId.toString()) || [];

      for (const allowed of parentAllowedIds) {
        if (!childAllowed.includes(allowed)) {
          bulkOps.push({
            insertOne: {
              document: {
                entityType: child.entityType,
                entityId: childEntityId,
                allowed: new Types.ObjectId(allowed),
              },
            },
          });
        }
      }

      for (const allowed of childAllowed) {
        if (!parentAllowedIds.includes(allowed)) {
          bulkOps.push({
            deleteOne: {
              filter: {
                entityType: child.entityType,
                entityId: childEntityId,
                allowed: new Types.ObjectId(allowed),
              },
            },
          });
        }
      }
    }

    if (bulkOps.length > 0) {
      await this.permissionModel.bulkWrite(bulkOps, {
        ordered: false,
      });
    }

    await this.categoryModel.updateOne(
      { _id: categoryObjectId },
      { $set: { permissionsInheritedToChildren: true } },
    );

    return {
      success: true,
      updatedEntities: descendants.length,
      operations: bulkOps.length,
    };
  }
}
