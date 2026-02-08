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
import { GroupsService } from 'src/groups/groups.service';
import { User } from 'src/schemas/Users.schema';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Group.name) private groupModel: Model<Group>,
    @InjectModel(User.name) private userModel: Model<User>,

    private usersService: UsersService,
    private groupsService: GroupsService,
  ) {}

  async getPermissionsForUser(userId: string, userGroupIds?: string[]) {
    const allowedIds = [
      new Types.ObjectId(userId),
      ...(userGroupIds || []).map((id) => new Types.ObjectId(id)),
    ];
    return await this.permissionModel
      .find({
        allowed: { $in: allowedIds },
      })
      .exec();
  }

  async createPermission(dto: CreatePermissionDto) {
    const { entityType, entityId, allowed, inheritToChildren, contextPath } =
      dto;

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
      contextPath,
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
        dto.contextPath,
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

  async resolveAllowedSubjectsForPath(
    parentEntityIds: mongoose.Types.ObjectId[],
  ): Promise<{
    allowedGroupIds: string[];
    allowedUserIds: string[];
  }> {
    const parentCount = parentEntityIds.length;
    if (!parentCount) {
      return { allowedGroupIds: [], allowedUserIds: [] };
    }

    const permissions = await this.permissionModel
      .find({
        entityType: EntityType.CATEGORY,
        entityId: { $in: parentEntityIds },
      })
      .select('entityId allowed')
      .lean();

    if (permissions.length < parentCount) {
      return { allowedGroupIds: [], allowedUserIds: [] };
    }

    const subjectCount = new Map<string, number>();

    for (const perm of permissions) {
      const key = perm.allowed.toString();
      subjectCount.set(key, (subjectCount.get(key) || 0) + 1);
    }

    const groups = await this.groupModel.find().select('_id members').lean();

    const allowedGroupIds: string[] = [];
    const groupIdSet = new Set<string>();

    for (const group of groups) {
      const gid = group._id.toString();
      if (subjectCount.get(gid) === parentCount) {
        allowedGroupIds.push(gid);
        groupIdSet.add(gid);
      }
    }

    const userToGroups = new Map<string, string[]>();

    for (const group of groups) {
      const gid = group._id.toString();
      for (const member of group.members) {
        const uid = member.toString();
        if (!userToGroups.has(uid)) {
          userToGroups.set(uid, []);
        }
        userToGroups.get(uid)!.push(gid);
      }
    }

    const users = await this.userModel.find().select('_id').lean();

    const allowedUserIds: string[] = [];

    for (const user of users) {
      const uid = user._id.toString();
      const userGroups = userToGroups.get(uid);

      if (userGroups?.length) continue;

      if (subjectCount.get(uid) === parentCount) {
        allowedUserIds.push(uid);
      }
    }

    return {
      allowedGroupIds,
      allowedUserIds,
    };
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
      const [userIds, groupIds] = await Promise.all([
        this.usersService.getAllUserIds(),
        this.groupsService.getAllGroupIds(),
      ]);

      const permissions = [...userIds, ...groupIds].map((id) => ({
        entityType: EntityType.CATEGORY,
        entityId: entity._id,
        allowed: id,
      }));

      if (permissions.length) {
        await this.permissionModel.insertMany(permissions, { ordered: false });
      }

      return;
    }

    const parentPaths: string[] = [];
    for (let i = 1; i < normalizedParts.length; i++) {
      parentPaths.push('/categories/' + normalizedParts.slice(0, i).join('/'));
    }

    const parents = await this.categoryModel
      .find({ categoryPath: { $in: parentPaths } })
      .select('_id')
      .lean();

    if (!parents.length) return;

    const parentIds = parents.map((p) => p._id);

    const { allowedGroupIds, allowedUserIds } =
      await this.resolveAllowedSubjectsForPath(parentIds);

    const permissions = [
      ...allowedGroupIds.map((id) => ({
        entityType: isProduct ? EntityType.PRODUCT : EntityType.CATEGORY,
        entityId: entity._id,
        allowed: new mongoose.Types.ObjectId(id),
      })),
      ...allowedUserIds.map((id) => ({
        entityType: isProduct ? EntityType.PRODUCT : EntityType.CATEGORY,
        entityId: entity._id,
        allowed: new mongoose.Types.ObjectId(id),
      })),
    ];

    if (permissions.length) {
      await this.permissionModel.insertMany(permissions, { ordered: false });
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
  private async isProductUnderBlockedCategory(
    product: any,
    allowedGroupId: string,
  ): Promise<boolean> {
    const pathToString = (path: string | string[] | Array<string>): string => {
      if (!path) return '';
      if (Array.isArray(path)) {
        return path.length > 0 ? path[0] : '';
      }
      return path;
    };
    const productPathStr = pathToString(product.productPath);
    if (!productPathStr) return false;
    const pathParts = productPathStr.split('/').filter(Boolean);
    const categoryParts =
      pathParts[0] === 'categories'
        ? pathParts.slice(1, -1)
        : pathParts.slice(0, -1);
    for (let i = 1; i <= categoryParts.length; i++) {
      const parentCategoryPath =
        '/categories/' + categoryParts.slice(0, i).join('/');
      const parentCategory = await this.categoryModel
        .findOne({ categoryPath: parentCategoryPath })
        .select('_id')
        .lean();
      if (parentCategory) {
        const hasPermission = await this.permissionModel.findOne({
          entityType: EntityType.CATEGORY,
          entityId: parentCategory._id,
          allowed: new mongoose.Types.ObjectId(allowedGroupId),
        });
        if (!hasPermission) {
          return true;
        }
      }
    }
    return false;
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
    const blockedProductsPromises = allProducts.map(async (p) => {
      const productId = String(p._id);
      const underBlockedCategory = await this.isProductUnderBlockedCategory(
        p,
        groupId,
      );
      const isBlocked = underBlockedCategory;

      return isBlocked
        ? {
            id: productId,
            name: p.productName,
            type: 'product' as const,
            image: p.productImages?.[0] || null,
            groupId,
          }
        : null;
    });
    const blockedProductsResults = await Promise.all(blockedProductsPromises);
    const blockedProducts = blockedProductsResults.filter((p) => p !== null);
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
    const availableProductsPromises = allProducts.map(async (p) => {
      const productId = String(p._id);
      const underBlockedCategory = await this.isProductUnderBlockedCategory(
        p,
        groupId,
      );
      const isAvailable = !underBlockedCategory;
      return isAvailable
        ? {
            id: productId,
            name: p.productName,
            type: 'product' as const,
            image: p.productImages?.[0] || null,
            groupId,
          }
        : null;
    });
    const availableProductsResults = await Promise.all(
      availableProductsPromises,
    );
    const availableProducts = availableProductsResults.filter(
      (p) => p !== null,
    );
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
    contextPath?: string,
  ): Promise<{ canCreate: boolean; reason?: string }> {
    if (entityType === EntityType.CATEGORY) {
      const category = await this.categoryModel.findById(entityId).lean();

      if (!category) {
        return { canCreate: false, reason: 'הקטגוריה לא נמצאה' };
      }

      const parentPaths = this.extractParentCategoryPaths(
        category.categoryPath,
      );

      return this.validateParentCategoryPermissions(
        parentPaths,
        allowedId,
        this.categoryModel,
        this.permissionModel,
      );
    }

    if (entityType === EntityType.PRODUCT) {
      const product = await this.productModel.findById(entityId).lean();

      if (!product) {
        return { canCreate: false, reason: 'המוצר לא נמצא' };
      }

      if (!contextPath) {
        return {
          canCreate: false,
          reason: 'חסר נתיב הקשר לבדיקת הרשאות',
        };
      }

      if (!product.productPath.includes(contextPath)) {
        return {
          canCreate: false,
          reason: 'המוצר אינו שייך לקטגוריה זו',
        };
      }

      const parentPaths = this.extractParentCategoryPaths(contextPath);

      return this.validateParentCategoryPermissions(
        parentPaths,
        allowedId,
        this.categoryModel,
        this.permissionModel,
      );
    }

    return { canCreate: true };
  }

  async validateParentCategoryPermissions(
    categoryPaths: string[],
    allowedId: string,
    categoryModel: Model<Category>,
    permissionModel: Model<Permission>,
  ): Promise<{ canCreate: boolean; reason?: string }> {
    if (!categoryPaths.length) return { canCreate: true };

    const parentCategories = await categoryModel
      .find({ categoryPath: { $in: categoryPaths } })
      .select('_id categoryName')
      .lean();

    if (!parentCategories.length) return { canCreate: true };

    const parentIds = parentCategories.map((c) => c._id);

    const permissions = await permissionModel
      .find({
        entityType: EntityType.CATEGORY,
        entityId: { $in: parentIds },
        allowed: new mongoose.Types.ObjectId(allowedId),
      })
      .select('entityId')
      .lean();

    const allowedSet = new Set(permissions.map((p) => p.entityId.toString()));

    const blockedParent = parentCategories.find(
      (c) => !allowedSet.has(c._id.toString()),
    );

    if (blockedParent) {
      return {
        canCreate: false,
        reason: `לא ניתן לשחרר פריט זה כי קטגורית האב "${blockedParent.categoryName}" חסומה`,
      };
    }

    return { canCreate: true };
  }

  extractParentCategoryPaths(path: string): string[] {
    const parts = path.split('/').filter(Boolean);
    const normalized = parts[0] === 'categories' ? parts.slice(1) : parts;

    const parents: string[] = [];

    for (let i = 1; i < normalized.length; i++) {
      parents.push('/categories/' + normalized.slice(0, i).join('/'));
    }

    return parents;
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

    await this.categoryModel.updateOne(
      { _id: categoryObjectId },
      { $set: { permissionsInheritedToChildren: true } },
    );

    if (descendants.length === 0) {
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

    const descendantCategoryIds = descendants
      .filter((d) => d.entityType === EntityType.CATEGORY)
      .map((d) => new Types.ObjectId(d.entityId));

    if (descendantCategoryIds.length > 0) {
      await this.categoryModel.updateMany(
        { _id: { $in: descendantCategoryIds } },
        { $set: { permissionsInheritedToChildren: true } },
      );
    }

    return {
      success: true,
      updatedEntities: descendants.length,
      operations: bulkOps.length,
    };
  }
  async getProductPathsWithPermissions(productId: string) {
    const product = await this.productModel
      .findById(productId)
      .select('productName productImages productPath')
      .lean();
    if (!product) {
      throw new HttpException('המוצר לא נמצא', 404);
    }
    const paths = Array.isArray(product.productPath)
      ? product.productPath
      : [product.productPath];
    const pathsWithPermissions = await Promise.all(
      paths.map(async (path: any) => {
        const pathStr = typeof path === 'string' ? path : String(path);
        const pathParts = pathStr.split('/').filter(Boolean);
        const categoryParts =
          pathParts[0] === 'categories'
            ? pathParts.slice(1, -1)
            : pathParts.slice(0, -1);
        const categoryPath = '/categories/' + categoryParts.join('/');
        const parentCategory = await this.categoryModel
          .findOne({ categoryPath })
          .select('_id categoryName categoryImage')
          .lean();
        if (!parentCategory) {
          return null;
        }
        const categoryPermissions = await this.permissionModel
          .find({
            entityType: EntityType.CATEGORY,
            entityId: parentCategory._id,
          })
          .lean();
        const parentCategoryPaths: string[] = [];
        for (let i = 1; i < categoryParts.length; i++) {
          const ancestorPath =
            '/categories/' + categoryParts.slice(0, i).join('/');
          parentCategoryPaths.push(ancestorPath);
        }
        const ancestorCategories = await this.categoryModel
          .find({ categoryPath: { $in: parentCategoryPaths } })
          .select('_id categoryName')
          .lean();
        const ancestorPermissionChecks = await Promise.all(
          ancestorCategories.map(async (ancestor) => {
            const perms = await this.permissionModel
              .find({
                entityType: EntityType.CATEGORY,
                entityId: ancestor._id,
              })
              .lean();
            return {
              categoryId: ancestor._id.toString(),
              categoryName: ancestor.categoryName,
              allowedIds: perms.map((p) => p.allowed.toString()),
            };
          }),
        );
        return {
          path: pathStr,
          categoryId: parentCategory._id.toString(),
          categoryName: parentCategory.categoryName,
          categoryImage: parentCategory.categoryImage,
          categoryPermissions: categoryPermissions.map((p) => ({
            _id: p._id.toString(),
            allowed: p.allowed.toString(),
          })),
          ancestorCategories: ancestorPermissionChecks,
        };
      }),
    );
    return {
      product: {
        _id: product._id.toString(),
        name: product.productName,
        image: product.productImages?.[0] || null,
      },
      paths: pathsWithPermissions.filter((p) => p !== null),
    };
  }
  async deletePermissionsForEntity(
    entityType: EntityType,
    entityId: string,
    opts?: { cascade?: boolean },
  ) {
    const entityObjectId = new Types.ObjectId(entityId);
    if (entityType !== EntityType.CATEGORY || !opts?.cascade) {
      const res = await this.permissionModel.deleteMany({
        entityType,
        entityId: entityObjectId,
      });

      return { success: true, deleted: res.deletedCount ?? 0 };
    }

    const descendants = await this.getAllCategoryDescendants(entityId);

    const categoryIds = [
      entityId,
      ...descendants
        .filter((d) => d.entityType === EntityType.CATEGORY)
        .map((d) => d.entityId),
    ].map((id) => new Types.ObjectId(id));

    const productIds = descendants
      .filter((d) => d.entityType === EntityType.PRODUCT)
      .map((d) => new Types.ObjectId(d.entityId));

    const or: any[] = [];
    if (categoryIds.length)
      or.push({
        entityType: EntityType.CATEGORY,
        entityId: { $in: categoryIds },
      });
    if (productIds.length)
      or.push({
        entityType: EntityType.PRODUCT,
        entityId: { $in: productIds },
      });
    const res = await this.permissionModel.deleteMany({ $or: or });

    return {
      success: true,
      deleted: res.deletedCount ?? 0,
      cascade: true,
      deletedEntities: {
        categories: categoryIds.length,
        products: productIds.length,
      },
    };
  }

  async deletePermissionsForAllowed(allowedId: string) {
    const res = await this.permissionModel.deleteMany({
      allowed: new Types.ObjectId(allowedId),
    });

    return { success: true, deleted: res.deletedCount ?? 0 };
  }

  async getPermissionsByEntityId(entityId: string, entityType: EntityType) {
    const permissions = await this.permissionModel
      .find({
        entityId: new Types.ObjectId(entityId),
        entityType,
      })
      .lean()
      .exec();

    return permissions;
  }

  async deletePermissionsByEntityId(entityId: string, entityType: EntityType) {
    await this.permissionModel.deleteMany({
      entityId: new Types.ObjectId(entityId),
      entityType,
    });
  }

  async restorePermissions(permissions: any[]) {
    for (const perm of permissions) {
      const newPermission = new this.permissionModel({
        entityId: perm.entityId,
        entityType: perm.entityType,
        allowed: perm.allowed,
      });
      await newPermission.save();
    }
  }
}
