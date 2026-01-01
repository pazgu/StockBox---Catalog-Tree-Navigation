import axios from "axios";
import { User } from "../types/types";

const API_URL = "http://localhost:4000/users";

export const userService = {
  getAll: async (): Promise<User[]> => {
    const { data } = await axios.get<User[]>(API_URL);
    return data;
  },

  create: async (user: User): Promise<User> => {
  try {
    console.log("Sending user to backend:", user); 
    const { data } = await axios.post<User>(API_URL, user);
    console.log("Backend response:", data); 
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
};
