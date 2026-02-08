export interface RecycleBinItemDTO {
  _id: string;
  itemId: string; 
  itemType: 'category' | 'product';
  itemName: string;
  itemImage: string;
  originalPath: string; 
  deletedAt: string;
  deletedBy?: string;
  childrenCount?: number; 
  productDescription?: string;
  productImages?: string[];
  customFields?: any[];
  categoryData?: {
    permissionsInheritedToChildren?: boolean;
  };
  movedChildrenCount?: number;

}

export interface RecycledCategory extends RecycleBinItemDTO {
  itemType: 'category';
  categoryPath: string;
  descendants?: RecycleBinItemDTO[]; 
}

export interface RecycledProduct extends RecycleBinItemDTO {
  itemType: 'product';
  productPath: string[];
}

export interface RestoreItemPayload {
  itemId: string;
  restoreChildren?: boolean; 
}

export interface DeletePermanentlyPayload {
  itemId: string;
  deleteChildren?: boolean;
}

export interface RecycleBinStats {
  totalItems: number;
  categories: number;
  products: number;
  oldestItem?: string;
}