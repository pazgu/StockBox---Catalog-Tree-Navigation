export interface CategoryImageDTO {
  Image_url: string;
  zoom: number;
  offsetX: number;
  offsetY: number;
}

export interface CategoryDTO {
  _id: string;
  categoryName: string;
  categoryPath: string;
  categoryImage: CategoryImageDTO;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryDTO {
  categoryName: string;
  categoryPath: string;
  imageFile?: File;
  categoryImage?: CategoryImageDTO;
}

export interface UpdateCategoryDTO {
  categoryName?: string;
  categoryPath?: string;
  categoryImage?: CategoryImageDTO;
}

export type AddCategoryResult = {
  name: string;
  imageFile?: File;
  categoryImage?: CategoryImageDTO;
};