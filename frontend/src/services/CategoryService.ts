import axios from "axios";

const API_BASE_URL = "http://localhost:4000"; 

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
  categoryImage: string;
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
  private baseUrl = `${API_BASE_URL}/categories`;

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

  async createCategory(category: CreateCategoryDTO): Promise<CategoryDTO> {
    try {
      const response = await axios.post<CategoryDTO>(this.baseUrl, category);
      return response.data;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  }

  async createSubCategory(
    parentCategory: string,
    subCategory: Omit<CreateCategoryDTO, "categoryPath">
  ): Promise<CategoryDTO> {
    try {
      const categoryWithPath: CreateCategoryDTO = {
        ...subCategory,
        categoryPath: `/categories/${parentCategory}/${subCategory.categoryName}`,
      };
      const response = await axios.post<CategoryDTO>(
        this.baseUrl,
        categoryWithPath
      );
      return response.data;
    } catch (error) {
      console.error("Error creating subcategory:", error);
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
    category: UpdateCategoryDTO
  ): Promise<CategoryDTO> {
    try {
      const response = await axios.patch<CategoryDTO>(
        `${this.baseUrl}/${id}`,
        category
      );
      return response.data;
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  }
}

export const categoriesService = new CategoriesService();
