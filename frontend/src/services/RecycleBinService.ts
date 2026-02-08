import { environment } from "../environments/environment.development";
import api from "./axios";
import {
  RecycleBinItemDTO,
  RestoreItemPayload,
  DeletePermanentlyPayload,
  RecycleBinStats,
} from "../components/models/recycleBin.models";

class RecycleBinService {
  private baseUrl = `${environment.API_URL}/recycle-bin`;

  private getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  async getRecycleBinItems(): Promise<RecycleBinItemDTO[]> {
    try {
      const response = await api.get<RecycleBinItemDTO[]>(
        this.baseUrl,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching recycle bin items:", error);
      throw error;
    }
  }

  async getStats(): Promise<RecycleBinStats> {
    try {
      const response = await api.get<RecycleBinStats>(
        `${this.baseUrl}/stats`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching recycle bin stats:", error);
      throw error;
    }
  }

  async moveCategoryToRecycleBin(
    categoryId: string,
    strategy: "cascade" | "move_up" = "cascade"
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post(
        `${this.baseUrl}/category/${categoryId}`,
        { strategy },
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error("Error moving category to recycle bin:", error);
      throw error;
    }
  }

  async moveProductToRecycleBin(
    productId: string,
    categoryPath?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post(
        `${this.baseUrl}/product/${productId}`,
        { categoryPath },
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error("Error moving product to recycle bin:", error);
      throw error;
    }
  }


  async restoreItem(
    payload: RestoreItemPayload
  ): Promise<{ success: boolean; message: string; item?: RecycleBinItemDTO }> {
    try {
      const response = await api.post(
        `${this.baseUrl}/restore`,
        payload,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error("Error restoring item:", error);
      throw error;
    }
  }


  async permanentlyDelete(
    payload: DeletePermanentlyPayload
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`${this.baseUrl}/permanent`, {
        ...this.getAuthHeaders(),
        data: payload,
      });
      return response.data;
    } catch (error) {
      console.error("Error permanently deleting item:", error);
      throw error;
    }
  }


  async emptyRecycleBin(): Promise<{ success: boolean; message: string; deletedCount: number }> {
    try {
      const response = await api.delete(
        `${this.baseUrl}/empty`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error("Error emptying recycle bin:", error);
      throw error;
    }
  }
}

export const recycleBinService = new RecycleBinService();