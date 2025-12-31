import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000'; // Update with your backend URL

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

class CategoriesService {
  private baseUrl = `${API_BASE_URL}/categories`;

  async getCategories(): Promise<CategoryDTO[]> {
    try {
      const response = await axios.get<CategoryDTO[]>(this.baseUrl);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  async createCategory(category: CreateCategoryDTO): Promise<CategoryDTO> {
    try {
      const response = await axios.post<CategoryDTO>(this.baseUrl, category);
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }
}

export const categoriesService = new CategoriesService();