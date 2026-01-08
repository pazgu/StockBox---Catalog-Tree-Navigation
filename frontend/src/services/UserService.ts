import axios from "axios";
import { environment } from "../environments/environment.development";
import { User } from "../components/models/user.models";

const API_URL = environment.API_URL + "/users";

export const userService = {
  getAll: async (): Promise<User[]> => {
    const { data } = await axios.get<User[]>(API_URL);
    return data;
  },

  create: async (user: User): Promise<User> => {
  try {
    const { data } = await axios.post<User>(API_URL, user);
    return data;
  } catch (err) {
    console.error("Error creating user:", err);
    throw err; 
  }
},


  update: async (id: string, updates: Partial<User>): Promise<User> => {
    const { data } = await axios.patch<User>(`${API_URL}/${id}`, updates);
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  },

  block: async (id: string, isBlocked: boolean): Promise<User> => {
    const { data } = await axios.patch<User>(`${API_URL}/${id}/block`, { isBlocked });
    return data;
  },
};
