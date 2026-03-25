/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  ServiceUnavailableException,
  OnModuleInit,
} from '@nestjs/common';
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product } from '../schemas/Products.schema';
import { CreateProductDto } from './dtos/CreateProduct.dto';
import { MoveProductDto } from './dtos/MoveProduct.dto';
import { DuplicateProductDto } from './dtos/DuplicateProduct.dto';
import { uploadBufferToCloudinary } from 'src/utils/cloudinary/upload.util';
import { deleteFromCloudinary } from 'src/utils/cloudinary/delete.util';
import { PermissionsService } from 'src/permissions/permissions.service';
import { EntityType } from 'src/schemas/Permissions.schema';
import { UpdateProductDto } from './dtos/UpdateProduct.dto';
import { Category } from 'src/schemas/Categories.schema';
import { Group } from 'src/schemas/Groups.schema';
import { NameLock } from 'src/schemas/NameLock.schema';
import { UsersService } from 'src/users/users.service';
import { normalizeName } from 'src/utils/nameLock';
import { SocketService } from 'src/socket/socket.service';
import { UserRole } from 'src/schemas/Users.schema';
import { Cron, CronExpression } from '@nestjs/schedule';
@Injectable()
export class ProductsService implements OnModuleInit {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Group.name) private groupModel: Model<Group>,
    @InjectModel(NameLock.name) private nameLockModel: Model<NameLock>,
    private usersService: UsersService,

    private permissionsService: PermissionsService,
    private socketService: SocketService,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productModel.find().exec();
  }

  async findByPath(
    path: string,
    user?: { userId: string; role: string },
  ): Promise<Product[]> {
    if (!user) return [];

    const escapedPath = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const matchingProducts = await this.productModel
      .find({ productPath: new RegExp(`^${escapedPath}`) })
      .exec();

    const directChildren = matchingProducts.filter((product) => {
      return product.productPath.some((p) => {
        if (!p.startsWith(path)) return false;

        const remainingPath = p.substring(path.length);
        const slashCount = (remainingPath.match(/\//g) || []).length;
        return slashCount === 1;
      });
    });

    if (user.role === 'editor') {
      return directChildren;
    }

    if (user.role !== 'viewer') {
      return [];
    }

    const userGroups = await this.groupModel
      .find({ members: user.userId })
      .select('_id')
      .lean();

    const userGroupIds = userGroups.map((g) => g._id.toString());

    const permissions = await this.permissionsService.getPermissionsForUser(
      user.userId,
      userGroupIds,
    );

    const productGroupPermissions = new Map<string, Set<string>>();
    const productUserPermissions = new Set<string>();

    for (const p of permissions) {
      if (p.entityType !== EntityType.PRODUCT) continue;

      const productId = p.entityId.toString();
      const allowedId = p.allowed.toString();

      if (userGroupIds.includes(allowedId)) {
        if (!productGroupPermissions.has(productId)) {
          productGroupPermissions.set(productId, new Set());
        }
        productGroupPermissions.get(productId)!.add(allowedId);
      } else if (allowedId === user.userId) {
        productUserPermissions.add(productId);
      }
    }

    const visibleProducts = directChildren.filter((product) => {
      const productId = product._id.toString();

      if (userGroupIds.length > 0) {
        const groupSet = productGroupPermissions.get(productId);
        return (
          !!groupSet && userGroupIds.every((groupId) => groupSet.has(groupId))
        );
      }

      return productUserPermissions.has(productId);
    });

    return visibleProducts;
  }

  async create(createProductDto: CreateProductDto, file?: Express.Multer.File) {
    let productImages: string[] = [];

    if (file?.buffer) {
      try {
        const uploaded = await uploadBufferToCloudinary(
          file.buffer,
          'stockbox/products',
        );
        productImages = [uploaded.secure_url];
      } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        throw new ServiceUnavailableException(
          'Image upload service is temporarily unavailable. Please try again.',
        );
      }
    } else {
      const defaultUrl = process.env.DEFAULT_PRODUCT_IMAGE_URL;
      if (defaultUrl) productImages = [defaultUrl];
    }

    let cleanCustomFields: any[] = [];

    if (createProductDto.customFields) {
      try {
        const parsed =
          typeof createProductDto.customFields === 'string'
            ? JSON.parse(createProductDto.customFields)
            : createProductDto.customFields;
        if (Array.isArray(parsed)) {
          cleanCustomFields = parsed.filter((f) => f && f.title && f.type);
        }
      } catch (error) {
        console.warn('Failed to parse customFields, defaulting to empty array');
        cleanCustomFields = [];
      }
    }
    const nameKey = normalizeName(createProductDto.productName);
    try {
      await this.nameLockModel.create({
        nameKey,
        type: 'product',
        refId: 'pending',
      });
    } catch (error: any) {
      if (error?.code === 11000) {
        throw new ConflictException('שם זה כבר קיים. נא לבחור שם ייחודי אחר.');
      }
      throw error;
    }
    const newProductData = {
      productName: createProductDto.productName,
      nameKey,
      productDescription: createProductDto.productDescription || '',
      productPath: [createProductDto.productPath],
      productImages: productImages,
      customFields: cleanCustomFields,
    };

    try {
      const newProduct = new this.productModel(newProductData);
      const savedProduct = await newProduct.save();
      await this.nameLockModel.updateOne(
        { nameKey },
        { $set: { refId: savedProduct._id.toString() } },
      );
      if (createProductDto.allowAll) {
        const userIds =
          await this.permissionsService.assignPermissionsForNewEntity(
            savedProduct,
          );
        if (userIds?.length) {
          this.socketService.emitToUsers(
            userIds,
            'product_added',
            savedProduct,
          );
          this.socketService.emitToRole(
            UserRole.EDITOR,
            'product_added',
            savedProduct,
          );
        } else {
          this.socketService.emitToAll('product_added', savedProduct);
        }
      } else {
        this.socketService.emitToRole(
          UserRole.EDITOR,
          'product_added',
          savedProduct,
        );
      }

      this.socketService.emitToAll('product_created', savedProduct);
      return savedProduct;
    } catch (error: any) {
      await this.nameLockModel.deleteOne({ nameKey }).catch(() => undefined);
      console.error('Mongoose Save Error:', error);

      if (error?.code === 11000) {
        throw new ConflictException('שם זה כבר קיים. נא לבחור שם ייחודי אחר.');
      }

      if (error?.name === 'ValidationError') {
        throw new BadRequestException('יש שדות חסרים או לא תקינים בטופס');
      }

      throw new InternalServerErrorException(
        'אירעה שגיאה ביצירת המוצר, אנא נסו שוב מאוחר יותר',
      );
    }
  }

  async update(id: string, dto: UpdateProductDto) {
    const existing = await this.productModel.findById(id);
    if (!existing) throw new NotFoundException('Product not found');

    if (dto.customFields && Array.isArray(dto.customFields)) {
      dto.customFields = dto.customFields.map((field) => {
        if (field._id?.startsWith('new-')) {
          return { ...field, _id: new Types.ObjectId().toString() };
        }
        return field;
      });
    }
    let oldNameKey: string | null = null;
    let newNameKey: string | null = null;

    if (dto.productName && dto.productName !== existing.productName) {
      oldNameKey = normalizeName(existing.productName);
      newNameKey = normalizeName(dto.productName);
      if (!newNameKey) throw new BadRequestException('Invalid name');
      try {
        await this.nameLockModel.create({
          nameKey: newNameKey,
          type: 'product',
          refId: id,
        });
      } catch (e: any) {
        if (e?.code === 11000) {
          throw new BadRequestException(
            'שם זה כבר קיים. נא לבחור שם ייחודי אחר.',
          );
        }
        throw e;
      }

      const newSlug = this.slugify(dto.productName);
      const newPaths = existing.productPath.map((fullPath) => {
        const parentPath = this.getParentPath(fullPath);
        return `${parentPath}/${newSlug}`;
      });
      dto.productPath = newPaths;
      (dto as any).nameKey = newNameKey;
    }

    let updatedProduct;
    try {
      if (Array.isArray(dto.uploadFolders) && dto.uploadFolders.length === 0) {
        await this.productModel.findByIdAndUpdate(id, {
          $set: { uploadFolders: [] },
        });
      }
      updatedProduct = await this.productModel.findByIdAndUpdate(
        id,
        {
          $set: { ...dto, isBlocked: false, expiresAt: null, blockedBy: null },
        },
        { new: true },
      );
    } catch (e) {
      if (newNameKey) {
        await this.nameLockModel
          .deleteOne({ nameKey: newNameKey })
          .catch(() => undefined);
      }
      throw e;
    }

    if (!updatedProduct) {
      if (newNameKey) {
        await this.nameLockModel
          .deleteOne({ nameKey: newNameKey })
          .catch(() => undefined);
      }
      throw new NotFoundException('Product not found');
    }

    if (oldNameKey && newNameKey && oldNameKey !== newNameKey) {
      await this.nameLockModel
        .deleteOne({ nameKey: oldNameKey })
        .catch(() => undefined);
    }
    this.socketService.emitToAll('product_updated', updatedProduct);

    return updatedProduct;
  }

  async moveProduct(
    id: string,
    moveProductDto: MoveProductDto & { sourceCategoryPath: string },
  ) {
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const { newCategoryPath, sourceCategoryPath } = moveProductDto;

    for (const path of newCategoryPath) {
      if (path === '/categories') continue;
      const categoryExists = await this.categoryModel.findOne({
        categoryPath: path,
      });
      if (!categoryExists) {
        throw new BadRequestException(`Category path does not exist: ${path}`);
      }
    }

    const productName = product.productName.toLowerCase().replace(/\s+/g, '-');
    const newPaths = newCategoryPath.map(
      (catPath) => `${catPath}/${productName}`,
    );

    for (const newPath of newPaths) {
      const existingProduct = await this.productModel.findOne({
        productPath: newPath,
        _id: { $ne: id },
      });

      if (existingProduct) {
        throw new BadRequestException(
          'שם זה כבר קיים. נא לבחור שם ייחודי אחר.',
        );
      }
    }

    product.productPath = newPaths;
    const savedProduct = await product.save();
    if (newCategoryPath.length > 0) {
      const allowedUsers =
        await this.permissionsService.updatePermissionsOnMove(
          id,
          EntityType.PRODUCT,
          newCategoryPath[0],
        );
      this.socketService.emitToUsers(allowedUsers, 'product_moved', {
        newCategoryPath,
        sourceCategoryPath,
        savedProduct,
      });
      this.socketService.emitToRole(UserRole.EDITOR, 'product_moved', {
        newCategoryPath,
        sourceCategoryPath,
        savedProduct,
      });
    }

    return {
      success: true,
      message: `Product moved successfully to ${newPaths.length} ${newPaths.length === 1 ? 'category' : 'categories'}`,
      product: await this.productModel.findById(id),
    };
  }

  async duplicateProduct(id: string, duplicateProductDto: DuplicateProductDto) {
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const { additionalCategoryPaths } = duplicateProductDto;

    for (const path of additionalCategoryPaths) {
      const categoryExists = await this.categoryModel.findOne({
        categoryPath: path,
      });

      if (!categoryExists) {
        throw new BadRequestException(`Category path does not exist: ${path}`);
      }
    }

    const productName = product.productName.toLowerCase().replace(/\s+/g, '-');
    const newPaths = additionalCategoryPaths.map(
      (catPath) => `${catPath}/${productName}`,
    );

    for (const newPath of newPaths) {
      if (product.productPath.includes(newPath)) {
        throw new BadRequestException(
          'שם זה כבר קיים. נא לבחור שם ייחודי אחר.',
        );
      }

      const existingProduct = await this.productModel.findOne({
        productPath: newPath,
        _id: { $ne: id },
      });

      if (existingProduct) {
        throw new BadRequestException(
          'שם זה כבר קיים. נא לבחור שם ייחודי אחר.',
        );
      }
    }

    product.productPath = [...product.productPath, ...newPaths];
    const savedProduct = await product.save();

    const allowedUserIds =
      await this.permissionsService.assignPermissionsOnDuplicate(
        id,
        additionalCategoryPaths,
      );

    if (allowedUserIds.length > 0) {
      this.socketService.emitToUsers(
        allowedUserIds,
        'product_added',
        savedProduct,
      );
      this.socketService.emitToRole(
        UserRole.EDITOR,
        'product_added',
        savedProduct,
      );
    } else {
      this.socketService.emitToAll('product_added', savedProduct);
    }

    return {
      success: true,
      message: `Product duplicated successfully to ${newPaths.length} additional ${newPaths.length === 1 ? 'category' : 'categories'}`,
      product: await this.productModel.findById(id),
    };
  }

  private async deleteProductImage(imageUrl: string): Promise<void> {
    try {
      const publicId = this.extractCloudinaryPublicId(imageUrl);
      if (publicId) {
        await deleteFromCloudinary(publicId);
      }
    } catch (error) {
      console.error(
        `Failed to delete image from Cloudinary: ${(error as Error).message}`,
      );
    }
  }

  private extractCloudinaryPublicId(url: string): string | null {
    try {
      const matches = url.match(/upload\/(?:v\d+\/)?(.+)\.\w+$/);
      return matches ? matches[1] : null;
    } catch {
      return null;
    }
  }

  private slugify(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .normalize('NFKC')
      .replace(/\s+/g, '-')
      .replace(/[^\u0590-\u05FFa-z0-9-]/gi, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private getParentPath(fullProductPath: string): string {
    const idx = fullProductPath.lastIndexOf('/');
    return idx === -1 ? '' : fullProductPath.substring(0, idx);
  }

  async getById(id: string, user?: { userId: string; role: string }) {
    const product = await this.productModel.findById(id).lean();
    if (!product) throw new NotFoundException('Product not found');

    if (!user) throw new ForbiddenException('Unauthorized');
    if (user.role === 'editor') return product;

    if (user.role !== 'viewer') {
      throw new ForbiddenException('Unauthorized');
    }

    const userGroups = await this.groupModel
      .find({ members: user.userId })
      .select('_id')
      .lean();

    const userGroupIds = userGroups.map((g) => g._id.toString());

    const permissions = await this.permissionsService.getPermissionsForUser(
      user.userId,
      userGroupIds,
    );

    const productGroupPermissions = new Set<string>();
    let hasUserPermission = false;

    for (const p of permissions) {
      if (p.entityType !== EntityType.PRODUCT) continue;
      if (p.entityId.toString() !== product._id.toString()) continue;

      const allowedId = p.allowed.toString();

      if (userGroupIds.includes(allowedId)) {
        productGroupPermissions.add(allowedId);
      } else if (allowedId === user.userId) {
        hasUserPermission = true;
      }
    }

    if (userGroupIds.length > 0) {
      const allGroupsHavePermission = userGroupIds.every((groupId) =>
        productGroupPermissions.has(groupId),
      );

      if (!allGroupsHavePermission) {
        throw new ForbiddenException('No permission to view this product');
      }
    } else {
      if (!hasUserPermission) {
        throw new ForbiddenException('No permission to view this product');
      }
    }

    return {
      ...product,
      blockedBy: product.blockedBy ?? null,
    };
  }

  async deleteFromSpecificPaths(
    id: string,
    pathsToDelete: string[],
  ): Promise<{ success: boolean; message: string }> {
    const product = await this.productModel.findById(id);

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    try {
      const updatedPaths = product.productPath.filter(
        (path) => !pathsToDelete.includes(path),
      );

      if (updatedPaths.length === product.productPath.length) {
        throw new BadRequestException(
          `None of the specified paths exist for this product`,
        );
      }

      if (updatedPaths.length === 0) {
        if (product.productImages && product.productImages.length > 0) {
          await Promise.all(
            product.productImages.map((url) => this.deleteProductImage(url)),
          );
        }

        await this.productModel.findByIdAndDelete(id);
        await this.usersService.removeItemFromAllUserFavorites(id);

        this.socketService.emitToAll('product_deleted', {
          productId: id,
          deletedPaths: pathsToDelete,
          remainingPaths: [],
          deletedCompletely: true,
          movedToRecycleBin: false,
          productName: product.productName,
        });

        return {
          success: true,
          message: `Product "${product.productName}" deleted completely`,
        };
      }

      product.productPath = updatedPaths;
      await product.save();

      this.socketService.emitToAll('product_deleted', {
        productId: id,
        deletedPaths: pathsToDelete,
        remainingPaths: updatedPaths,
        deletedCompletely: false,
        movedToRecycleBin: false,
        productName: product.productName,
      });

      return {
        success: true,
        message: `Product "${product.productName}" removed from ${pathsToDelete.length} location(s)`,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to delete product from specific paths: ${(error as Error).message}`,
      );
    }
  }
  private editLockTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private pendingSocketUpdates = new Map<string, string | null>();
  private socketFlushScheduled = false;

  async onModuleInit() {
    await this.releaseExpiredLocks();
  }
  @Cron(CronExpression.EVERY_5_MINUTES)
  async releaseExpiredLocks() {
    const now = new Date();
    const expiredProducts = await this.productModel
      .find(
        { isBlocked: true, expiresAt: { $lt: now } },
        { _id: 1, 'blockedBy.userId': 1 },
      )
      .lean();
    if (!expiredProducts.length) return;
    const productIds = expiredProducts.map((p) => p._id);
    await this.productModel.updateMany(
      { _id: { $in: productIds } },
      { $set: { isBlocked: false, blockedBy: null, expiresAt: null } },
    );
    expiredProducts.forEach((p) => {
      const blockedUserId = p.blockedBy?.userId?.toString() || null;
      this.pendingSocketUpdates.set(p._id.toString(), blockedUserId);
      const existing = this.editLockTimers.get(p._id.toString());
      if (existing) {
        clearTimeout(existing);
        this.editLockTimers.delete(p._id.toString());
      }
    });
    this.flushPendingSocketUpdates();
  }
  private async releaseLock(productId: string, blockedUserId?: string | null) {
    await this.productModel.findOneAndUpdate(
      { _id: productId, isBlocked: true },
      { $set: { isBlocked: false, blockedBy: null, expiresAt: null } },
      { new: true },
    );
    this.pendingSocketUpdates.set(productId, blockedUserId || null);
    this.flushPendingSocketUpdates();
  }
  private flushPendingSocketUpdates() {
    if (this.socketFlushScheduled) return;
    this.socketFlushScheduled = true;
    setTimeout(() => {
      const updatesForRole: any[] = [];
      const userMessages = new Map<string, any[]>();
      this.pendingSocketUpdates.forEach((blockedUserId, productId) => {
        updatesForRole.push({
          productId,
          isBlocked: false,
          blockedBy: null,
          expiresAt: null,
        });
        if (blockedUserId) {
          if (!userMessages.has(blockedUserId))
            userMessages.set(blockedUserId, []);
          userMessages.get(blockedUserId)!.push({ productId });
        }
      });
      if (updatesForRole.length > 0) {
        this.socketService.emitToRole(
          UserRole.EDITOR,
          'products_edit_lock_changed',
          updatesForRole,
        );
      }
      userMessages.forEach((msgs, userId) => {
        this.socketService.emitToUser(
          userId,
          'product_edit_lock_expired',
          msgs,
        );
      });
      this.pendingSocketUpdates.clear();
      this.socketFlushScheduled = false;
    }, 50);
  }
  async setEditLock(
    id: string,
    isBlocked: boolean,
    editor?: { userId: string; userName: string },
  ): Promise<{ isBlocked: boolean; expiresAt: Date | null }> {
    const product = await this.productModel.findById(id);
    if (!product) throw new NotFoundException('Product not found');
    const expiresAt = isBlocked ? new Date(Date.now() + 20 * 60 * 1000) : null;
    let resolvedUserName = 'עורך';
    if (isBlocked && editor?.userId) {
      const user = await this.usersService.findById(editor.userId);
      resolvedUserName = user?.userName ?? 'עורך';
    }
    const blockedBy =
      isBlocked && editor
        ? {
            userId: new Types.ObjectId(editor.userId),
            userName: resolvedUserName,
          }
        : null;
    if (isBlocked) {
      const result = await this.productModel.findOneAndUpdate(
        { _id: id, isBlocked: false },
        { $set: { isBlocked: true, expiresAt, blockedBy } },
        { new: true },
      );
      if (!result)
        throw new ConflictException('המוצר נעול לעריכה על ידי עורך אחר');
      const timer = setTimeout(
        async () => {
          try {
            await this.releaseLock(id, blockedBy?.userId?.toString());
          } catch (err) {
            console.error(`Auto-release failed for product ${id}`, err);
          } finally {
            this.editLockTimers.delete(id);
          }
        },
        20 * 60 * 1000,
      );
      this.editLockTimers.set(id, timer);
    } else {
      await this.releaseLock(id, blockedBy?.userId?.toString());

      const existing = this.editLockTimers.get(id);
      if (existing) {
        clearTimeout(existing);
        this.editLockTimers.delete(id);
      }
    }
    this.socketService.emitToRole(
      UserRole.EDITOR,
      'product_edit_lock_changed',
      {
        productId: id,
        isBlocked,
        expiresAt,
        blockedBy: isBlocked ? blockedBy : null,
      },
    );
    return { isBlocked, expiresAt };
  }
}
