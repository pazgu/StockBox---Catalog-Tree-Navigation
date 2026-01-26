import { environment } from "../environments/environment.development";
import { User } from "../components/models/user.models";
import api from "./axios";

const API_URL = environment.API_URL + "/users";
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const userService = {
  getAll: async (): Promise<User[]> => {
    const { data } = await api.get<User[]>(API_URL);
    return data;
  },

  create: async (user: User): Promise<User> => {
  try {
    const { data } = await api.post<User>(API_URL, user);
    return data;
  } catch (err) {
    console.error("Error creating user:", err);
    throw err; 
  }
},

  update: async (id: string, updates: Partial<User>): Promise<User> => {
    const { data } = await api.patch<User>(`${API_URL}/${id}`, updates);
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`${API_URL}/${id}`);
  },

  block: async (id: string, isBlocked: boolean): Promise<User> => {
    const { data } = await api.patch<User>(`${API_URL}/${id}/block`, { isBlocked });
    return data;
  },
  toggleFavorite: async (
    itemId: string,
    type: 'product' | 'category'
  ): Promise<User> => {
    try {
      const { data } = await api.patch<User>(
        `${API_URL}/me/favorites/toggle`,
        { itemId, type },
        { headers: getAuthHeaders() }
      );
      return data;
    } catch (err) {
      console.error("Error toggling favorite:", err);
      throw err;
    }
  },
  getFavorites: async () => {
    try {
      const { data } = await api.get(
        `${API_URL}/me/favorites`,
        { headers: getAuthHeaders() }
      );
      return data;
    } catch (err) {
      console.error("Error fetching favorites:", err);
      throw err;
    }
  },
  isFavorite: async (itemId: string): Promise<boolean> => {
    try {
      const { data } = await api.get(
        `${API_URL}/me/favorites/${itemId}/check`,
        { headers: getAuthHeaders() }
      );
      return data.isFavorite;
    } catch (err) {
      console.error("Error checking favorite:", err);
      throw err;
    }
  },
};