import {
  CategoryDTO,
  CreateCategoryDTO,
  DeleteCategoryResponse,
  UpdateCategoryDTO,
} from "../components/models/category.models";
import { environment } from "./../environments/environment.development";
import api from "./axios";

class CategoriesService {
  private baseUrl = `${environment.API_URL}/categories`;
  async getCategories(): Promise<CategoryDTO[]> {
    try {
      const response = await api.get<CategoryDTO[]>(this.baseUrl);
      return response.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  }

  async getSubCategories(slug: string): Promise<CategoryDTO[]> {
    try {
      const response = await api.get<CategoryDTO[]>(
        `${this.baseUrl}/children/${slug}`,
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      throw error;
    }
  }

  async getDirectChildren(categoryPath: string): Promise<CategoryDTO[]> {
    try {
      let cleanPath = categoryPath.startsWith("/")
        ? categoryPath.substring(1)
        : categoryPath;

      if (cleanPath.startsWith("categories/")) {
        cleanPath = cleanPath.substring("categories/".length);
      }

      const response = await api.get<CategoryDTO[]>(
        `${this.baseUrl}/children/${cleanPath}`,
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching direct children:", error);
      throw error;
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

      const response = await api.post<CategoryDTO>(this.baseUrl, fd, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  }

  async deleteCategory(
  id: string,
  strategy: "cascade" | "move_up" = "cascade",
): Promise<DeleteCategoryResponse> {
  try {
    const response = await api.delete<DeleteCategoryResponse>(
      `${this.baseUrl}/${id}?strategy=${strategy}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
}


  async updateCategory(
    id: string,
    category: UpdateCategoryDTO & { imageFile?: File },
  ): Promise<CategoryDTO> {
    try {
      const fd = new FormData();

      if (category.categoryName)
        fd.append("categoryName", category.categoryName);
      if (category.categoryPath)
        fd.append("categoryPath", category.categoryPath);

      if (category.imageFile) {
        fd.append("categoryImageFile", category.imageFile);
      }

      const response = await api.patch<CategoryDTO>(
        `${this.baseUrl}/${id}`,
        fd,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  }

  async moveCategory(
    id: string,
    newParentPath: string,
  ): Promise<{ success: boolean; message: string; category: CategoryDTO }> {
    try {
      const response = await api.patch(`${this.baseUrl}/${id}/move`, {
        newParentPath,
      });
      return response.data;
    } catch (error) {
      console.error("Error moving category:", error);
      throw error;
    }
  }
  async getCategoryById(id: string): Promise<CategoryDTO | null> {
    try {
      const response = await api.get<CategoryDTO>(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error);
      return null;
    }
  }
}

export const categoriesService = new CategoriesService();
