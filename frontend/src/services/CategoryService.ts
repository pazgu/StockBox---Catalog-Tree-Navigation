import { environment } from "./../environments/environment.development";
import axios from "axios";

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

class CategoriesService {
  private baseUrl = `${environment.API_URL}/categories`;

  async getCategories(): Promise<CategoryDTO[]> {
    try {
      const response = await axios.get<CategoryDTO[]>(this.baseUrl);
      return response.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  }

  async getSubCategories(parentCategory: string): Promise<CategoryDTO[]> {
    try {
      const response = await axios.get<CategoryDTO[]>(
        `${this.baseUrl}/subcategories/${parentCategory}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      throw error;
    }
  }

  async getDirectChildren(categoryPath: string): Promise<CategoryDTO[]> {
    try {
      let cleanPath = categoryPath.startsWith('/') 
        ? categoryPath.substring(1) 
        : categoryPath;
      if (cleanPath.startsWith('categories/')) {
        cleanPath = cleanPath.substring('categories/'.length);
      }
      const response = await fetch(
        `${this.baseUrl}/children/${cleanPath}`
      );
      if (!response.ok) {
        return [];
      } 
      const data = await response.json();
      return data;
    } catch (error) {
      return [];
    }
  }

  async createCategory(category: CreateCategoryDTO): Promise<CategoryDTO> {
  try {
    const fd = new FormData();
    fd.append("categoryName", category.categoryName);
    fd.append("categoryPath", category.categoryPath);

    if (category.imageFile) {
      fd.append("categoryImageFile", category.imageFile); 
    }

    const response = await axios.post<CategoryDTO>(this.baseUrl, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
}


  async deleteCategory(id: string): Promise<DeleteCategoryResponse> {
    try {
      const response = await axios.delete<DeleteCategoryResponse>(
        `${this.baseUrl}/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  }

  async updateCategory(
  id: string,
  category: UpdateCategoryDTO & { imageFile?: File }
): Promise<CategoryDTO> {
  const fd = new FormData();

  if (category.categoryName) fd.append("categoryName", category.categoryName);
  if (category.categoryPath) fd.append("categoryPath", category.categoryPath);

  if (category.imageFile) {
    fd.append("categoryImageFile", category.imageFile);
  }

  const response = await axios.patch<CategoryDTO>(`${this.baseUrl}/${id}`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
}

}

export const categoriesService = new CategoriesService();
