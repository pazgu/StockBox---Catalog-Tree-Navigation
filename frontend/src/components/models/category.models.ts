export interface CategoryDTO {
  _id: string;
  categoryName: string;
  categoryPath: string;
  categoryImage: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryDTO {
  categoryName: string;
  categoryPath: string;
  imageFile?: File;
}


export interface DeleteCategoryResponse {
  success: boolean;
  message: string;
  deletedCategoryPath: string;
}

export interface UpdateCategoryDTO {
  categoryName?: string;
  categoryPath?: string;
  categoryImage?: string;
}


export type AddCategoryResult = {
  name: string;
  imageFile: File;
};

