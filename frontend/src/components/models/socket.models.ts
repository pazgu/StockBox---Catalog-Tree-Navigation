export type BulkMovedCategorySocketItem = {
  id: string;
  name: string;
  path: string;
};

export type BulkMovedProductSocketItem = {
  id: string;
  name: string;
  deletedPaths: string[];
  remainingPaths: string[];
  deletedCompletely: boolean;
  movedToRecycleBin: boolean;
};

export type CatalogItemsRemovedPayload = {
  categoryStrategy: "cascade" | "move_up";
  movedCategories: BulkMovedCategorySocketItem[];
  movedProducts: BulkMovedProductSocketItem[];
  successCount: number;
  failCount: number;
};

export type ProductRestoredPayload = {
  product: {
    _id: string;
    productName: string;
    productDescription?: string;
    productImages?: string[];
    productPath: string[];
    customFields?: any[];
    uploadFolders?: any[];
  };
  restoredPaths: string[];
};

export type ProductDeletedPayload = {
  productId: string;
  deletedPaths: string[];
  remainingPaths: string[];
  deletedCompletely: boolean;
  movedToRecycleBin?: boolean;
  productName?: string;
};

export type RecycleBinUpdatedPayload = {
  action: "added" | "restored" | "deleted";
  itemType: "product" | "category";
  itemName: string;
  itemPath: string;
};