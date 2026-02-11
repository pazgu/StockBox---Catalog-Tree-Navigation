import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RecycleBin } from 'src/schemas/RecycleBin.schema';
import { Category } from 'src/schemas/Categories.schema';
import { Product } from 'src/schemas/Products.schema';
import { PermissionsService } from 'src/permissions/permissions.service';
import { EntityType } from 'src/schemas/Permissions.schema';

@Injectable()
export class RecycleBinService {
  constructor(
    @InjectModel(RecycleBin.name) private recycleBinModel: Model<RecycleBin>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    private permissionsService: PermissionsService,
  ) {}

  async getRecycleBinItems(): Promise<RecycleBin[]> {
    return this.recycleBinModel.find().sort({ deletedAt: -1 }).lean().exec();
  }

  async getStats() {
    const items = await this.recycleBinModel.find().lean();
    const categories = items.filter((item) => item.itemType === 'category');
    const products = items.filter((item) => item.itemType === 'product');

    let oldestItem: Date | undefined;
    if (items.length > 0) {
      oldestItem = items.reduce(
        (oldest, item) => (item.deletedAt < oldest ? item.deletedAt : oldest),
        items[0].deletedAt,
      );
    }

    return {
      totalItems: items.length,
      categories: categories.length,
      products: products.length,
      oldestItem: oldestItem?.toISOString(),
    };
  }

  async moveCategoryToRecycleBin(
    categoryId: string,
    strategy: 'cascade' | 'move_up' = 'cascade',
    userId?: string,
  ) {
    const category = await this.categoryModel.findById(categoryId).lean();
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const categoryPath = category.categoryPath;
    const escapedPath = categoryPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    let childrenCount = 0;
    let descendants: any[] = [];
    let movedChildren: any[] = [];

    if (strategy === 'cascade') {
      const subcategories = await this.categoryModel
        .find({ categoryPath: new RegExp(`^${escapedPath}/`) })
        .lean();

      const products = await this.productModel
        .find({
          productPath: {
            $elemMatch: { $regex: new RegExp(`^${escapedPath}(/|$)`) },
          },
        })
        .lean();

      childrenCount = subcategories.length + products.length;

      descendants = [
        ...subcategories.map((cat) => ({
          itemId: cat._id,
          itemType: 'category',
          itemName: cat.categoryName,
          itemImage: cat.categoryImage,
          categoryPath: cat.categoryPath,
          permissionsInheritedToChildren: (cat as any)
            .permissionsInheritedToChildren,
        })),
        ...products.map((prod) => ({
          itemId: prod._id,
          itemType: 'product',
          itemName: prod.productName,
          itemImages: prod.productImages,
          productDescription: prod.productDescription,
          productPath: prod.productPath,
          customFields: prod.customFields,
          uploadFolders: prod.uploadFolders,
        })),
      ];
    } else if (strategy === 'move_up') {
      const parentPath = this.getParentPath(categoryPath);

      if (!parentPath || parentPath === '') {
        throw new BadRequestException(
          'Cannot move children up: category is already at root level',
        );
      }

      const subcategories = await this.categoryModel.find({
        categoryPath: new RegExp(`^${escapedPath}/`),
      });

      for (const subcat of subcategories) {
        const previousPath = subcat.categoryPath;
        const newPath = subcat.categoryPath.replace(categoryPath, parentPath);

        movedChildren.push({
          itemId: subcat._id,
          itemType: 'category',
          previousPath: previousPath,
          newPath: newPath,
        });

        await this.categoryModel.updateOne(
          { _id: subcat._id },
          { $set: { categoryPath: newPath } },
        );
      }

      const productsToUpdate = await this.productModel.find({
        productPath: {
          $elemMatch: { $regex: new RegExp(`^${escapedPath}(/|$)`) },
        },
      });

      for (const product of productsToUpdate) {
        const updatedPaths = product.productPath.map((p) => {
          if (p.startsWith(categoryPath + '/')) {
            return p.replace(categoryPath, parentPath);
          }
          if (p === categoryPath) {
            return parentPath;
          }
          return p;
        });

        movedChildren.push({
          itemId: product._id,
          itemType: 'product',
          previousPath: product.productPath,
          newPath: updatedPaths,
        });

        await this.productModel.updateOne(
          { _id: product._id },
          { $set: { productPath: updatedPaths } },
        );
      }
    }

    const permissions = await this.permissionsService.getPermissionsByEntityId(
      categoryId,
      EntityType.CATEGORY,
    );

    const recycleBinEntry = new this.recycleBinModel({
      itemId: new Types.ObjectId(categoryId),
      itemType: 'category',
      itemName: category.categoryName,
      itemImage: category.categoryImage,
      originalPath: categoryPath,
      deletedAt: new Date(),
      deletedBy: userId ? new Types.ObjectId(userId) : undefined,
      childrenCount,
      categoryPath: category.categoryPath,
      permissionsInheritedToChildren: (category as any)
        .permissionsInheritedToChildren,
      descendants,
      storedPermissions: permissions,
      movedChildren: movedChildren,
      movedChildrenCount: movedChildren.length,
    });

    await recycleBinEntry.save();

    if (strategy === 'cascade') {
      await this.categoryModel.deleteMany({
        categoryPath: new RegExp(`^${escapedPath}/`),
      });

      await this.productModel.deleteMany({
        productPath: {
          $elemMatch: { $regex: new RegExp(`^${escapedPath}(/|$)`) },
        },
      });

      for (const desc of descendants) {
        await this.permissionsService.deletePermissionsByEntityId(
          desc.itemId.toString(),
          desc.itemType === 'category'
            ? EntityType.CATEGORY
            : EntityType.PRODUCT,
        );
      }
    }

    await this.categoryModel.findByIdAndDelete(categoryId);
    await this.permissionsService.deletePermissionsByEntityId(
      categoryId,
      EntityType.CATEGORY,
    );

    return {
      success: true,
      message: `Category "${category.categoryName}" moved to recycle bin`,
    };
  }
  async moveProductToRecycleBin(
    productId: string,
    categoryPath?: string,
    userId?: string,
  ) {
    const product = await this.productModel.findById(productId).lean();
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    let specificPathDeleted: string | undefined;
    let shouldDeleteCompletely = false;

    if (categoryPath && product.productPath.length > 1) {
      const pathExists = product.productPath.some((p) =>
        p.startsWith(categoryPath),
      );

      if (!pathExists) {
        throw new BadRequestException(
          `Product does not exist in category: ${categoryPath}`,
        );
      }

      specificPathDeleted = product.productPath.find((p) =>
        p.startsWith(categoryPath),
      );

      const updatedPaths = product.productPath.filter(
        (path) => !path.startsWith(categoryPath),
      );

      await this.productModel.updateOne(
        { _id: productId },
        { $set: { productPath: updatedPaths } },
      );

      if (updatedPaths.length > 0) {
        return {
          success: true,
          message: `Product "${product.productName}" removed from this category`,
        };
      }

      shouldDeleteCompletely = true;
    } else {
      shouldDeleteCompletely = true;
      specificPathDeleted = product.productPath[0];
    }

    if (shouldDeleteCompletely) {
      const permissions =
        await this.permissionsService.getPermissionsByEntityId(
          productId,
          EntityType.PRODUCT,
        );

      const recycleBinEntry = new this.recycleBinModel({
        itemId: new Types.ObjectId(productId),
        itemType: 'product',
        itemName: product.productName,
        itemImage: product.productImages?.[0] || '',
        originalPath: specificPathDeleted || product.productPath[0],
        deletedAt: new Date(),
        deletedBy: userId ? new Types.ObjectId(userId) : undefined,
        productDescription: product.productDescription,
        productImages: product.productImages,
        customFields: product.customFields,
        uploadFolders: product.uploadFolders,
        allProductPaths: product.productPath,
        specificPathDeleted,
        storedPermissions: permissions,
      });

      await recycleBinEntry.save();

      await this.productModel.findByIdAndDelete(productId);

      await this.permissionsService.deletePermissionsByEntityId(
        productId,
        EntityType.PRODUCT,
      );

      return {
        success: true,
        message: `Product "${product.productName}" moved to recycle bin`,
      };
    }
  }

  async restoreItem(itemId: string, restoreChildren: boolean = false) {
    const recycleBinItem = await this.recycleBinModel
      .findOne({ _id: new Types.ObjectId(itemId) })
      .lean()
      .exec();

    if (!recycleBinItem) {
      throw new NotFoundException('Item not found in recycle bin');
    }

    if (recycleBinItem.itemType === 'category') {
      return this.restoreCategory(recycleBinItem as any, restoreChildren);
    } else {
      return this.restoreProduct(recycleBinItem as any);
    }
  }

  private async restoreCategory(
    recycleBinItem: RecycleBin,
    restoreChildren: boolean,
  ) {
    const parentPath = this.getParentPath(recycleBinItem.categoryPath!);
    if (parentPath && parentPath !== '/categories') {
      const parentExists = await this.categoryModel.findOne({
        categoryPath: parentPath,
      });
      if (!parentExists) {
        throw new BadRequestException(
          'Cannot restore: parent category no longer exists',
        );
      }
    }

    const existing = await this.categoryModel.findOne({
      categoryPath: recycleBinItem.categoryPath,
    });
    if (existing) {
      throw new BadRequestException('שם זה כבר קיים. נא לבחור שם ייחודי אחר.');
    }

    const restoredCategory = new this.categoryModel({
      _id: recycleBinItem.itemId,
      categoryName: recycleBinItem.itemName,
      categoryPath: recycleBinItem.categoryPath,
      categoryImage: recycleBinItem.itemImage,
      permissionsInheritedToChildren:
        recycleBinItem.permissionsInheritedToChildren,
    });

    await restoredCategory.save();

    if (recycleBinItem.storedPermissions) {
      await this.permissionsService.restorePermissions(
        recycleBinItem.storedPermissions,
      );
    }

    if (
      recycleBinItem.movedChildren &&
      recycleBinItem.movedChildren.length > 0
    ) {
      for (const movedChild of recycleBinItem.movedChildren) {
        if (movedChild.itemType === 'category') {
          const oldCategoryPath = movedChild.newPath as string;
          const newCategoryPath = movedChild.previousPath as string;

          await this.categoryModel.findByIdAndUpdate(movedChild.itemId, {
            categoryPath: newCategoryPath,
          });

          const escapedOldPath = oldCategoryPath.replace(
            /[.*+?^${}()|[\]\\]/g,
            '\\$&',
          );

          const subCategoriesToUpdate = await this.categoryModel.find({
            categoryPath: new RegExp(`^${escapedOldPath}/`),
          });

          for (const subcat of subCategoriesToUpdate) {
            const updatedPath = subcat.categoryPath.replace(
              oldCategoryPath,
              newCategoryPath,
            );
            await this.categoryModel.updateOne(
              { _id: subcat._id },
              { $set: { categoryPath: updatedPath } },
            );
          }

          const productsToUpdate = await this.productModel.find({
            productPath: {
              $elemMatch: { $regex: new RegExp(`^${escapedOldPath}(/|$)`) },
            },
          });

          for (const product of productsToUpdate) {
            const updatedPaths = product.productPath.map((p) => {
              if (p.startsWith(oldCategoryPath + '/')) {
                return p.replace(oldCategoryPath, newCategoryPath);
              }
              if (p === oldCategoryPath) {
                return newCategoryPath;
              }
              return p;
            });

            await this.productModel.updateOne(
              { _id: product._id },
              { $set: { productPath: updatedPaths } },
            );
          }
        } else if (movedChild.itemType === 'product') {
          const previousPaths = Array.isArray(movedChild.previousPath)
            ? movedChild.previousPath
            : [movedChild.previousPath];

          await this.productModel.findByIdAndUpdate(movedChild.itemId, {
            productPath: previousPaths,
          });
        }
      }
    }

    if (restoreChildren && recycleBinItem.descendants) {
      for (const desc of recycleBinItem.descendants) {
        if (desc.itemType === 'category') {
          const descCategory = new this.categoryModel({
            _id: desc.itemId,
            categoryName: desc.itemName,
            categoryPath: desc.categoryPath,
            categoryImage: desc.categoryImage,
            permissionsInheritedToChildren: desc.permissionsInheritedToChildren,
          });
          await descCategory.save();
        } else {
          const descProduct = new this.productModel({
            _id: desc.itemId,
            productName: desc.itemName,
            productImages: desc.itemImages,
            productDescription: desc.productDescription,
            productPath: desc.productPath,
            customFields: desc.customFields,
            uploadFolders: desc.uploadFolders,
          });
          await descProduct.save();
        }
      }
    }

    await this.recycleBinModel.findByIdAndDelete(recycleBinItem._id);

    return {
      success: true,
      message: `Category "${recycleBinItem.itemName}" restored successfully`,
      item: restoredCategory,
    };
  }

  private async restoreProduct(recycleBinItem: RecycleBin) {
    const pathsToRestore = recycleBinItem.allProductPaths || [
      recycleBinItem.originalPath,
    ];

    const validPaths: string[] = [];
    for (const path of pathsToRestore) {
      const parentPath = this.getParentPath(path);
      const parentExists = await this.categoryModel.findOne({
        categoryPath: parentPath,
      });
      if (parentExists) {
        validPaths.push(path);
      }
    }

    if (validPaths.length === 0) {
      throw new BadRequestException(
        'Cannot restore: no parent categories exist for this product',
      );
    }

    const restoredProduct = new this.productModel({
      _id: recycleBinItem.itemId,
      productName: recycleBinItem.itemName,
      productImages: recycleBinItem.productImages,
      productDescription: recycleBinItem.productDescription,
      productPath: validPaths,
      customFields: recycleBinItem.customFields,
      uploadFolders: recycleBinItem.uploadFolders,
    });

    await restoredProduct.save();

    if (recycleBinItem.storedPermissions) {
      await this.permissionsService.restorePermissions(
        recycleBinItem.storedPermissions,
      );
    }

    await this.recycleBinModel.findByIdAndDelete(recycleBinItem._id);

    return {
      success: true,
      message: `Product "${recycleBinItem.itemName}" restored successfully`,
      item: restoredProduct,
    };
  }

  async permanentlyDelete(itemId: string, deleteChildren: boolean = false) {
    const recycleBinItem = await this.recycleBinModel
      .findOne({ _id: new Types.ObjectId(itemId) })
      .lean()
      .exec();

    if (!recycleBinItem) {
      throw new NotFoundException('Item not found in recycle bin');
    }

    await this.recycleBinModel.findByIdAndDelete(new Types.ObjectId(itemId));

    return {
      success: true,
      message: `${recycleBinItem.itemType === 'category' ? 'Category' : 'Product'} "${recycleBinItem.itemName}" permanently deleted`,
    };
  }

  async emptyRecycleBin() {
    const result = await this.recycleBinModel.deleteMany({});

    return {
      success: true,
      message: 'Recycle bin emptied successfully',
      deletedCount: result.deletedCount,
    };
  }

  private getParentPath(fullPath: string): string {
    const idx = fullPath.lastIndexOf('/');
    return idx === -1 ? '' : fullPath.substring(0, idx);
  }
}
