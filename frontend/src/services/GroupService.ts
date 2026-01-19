import axios from "axios";
import { environment } from "../environments/environment.development";
import { Group } from "../components/models/group.models";

const api = axios.create({
  baseURL: environment.API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const groupService = {

  async getGroups(): Promise<Group[]> {
    const response = await api.get("/groups");
    
    const transformedGroups: Group[] = response.data.map((g: any) => ({
      id: g._id || g.id,
      name: g.groupName,
      members: g.members?.map((m: any) => 
        typeof m === 'string' ? m : (m._id || m.id)
      ) || [],
      permissions: [],
      bannedItems: [],
    }));
    
    return transformedGroups;
  },
  async createGroup(groupName: string): Promise<Group> {
    const response = await api.post("/groups", {
      groupName,
      members: [],
    });

    return {
      id: response.data._id || response.data.id,
      name: response.data.groupName,
      members: [],
      permissions: [],
      bannedItems: [],
    };
  },

  async updateGroupMembers(groupId: string, members: string[]): Promise<string[]> {
    const response = await api.patch(`/groups/${groupId}`, { members });
    
    const updatedMembers = response.data.members?.map((m: any) => 
      typeof m === 'string' ? m : (m._id || m.id)
    ) || [];
    
    return updatedMembers;
  },

  async updateGroupName(groupId: string, groupName: string): Promise<void> {
    await api.patch(`/groups/${groupId}`, { groupName });
  },
  
  async deleteGroup(groupId: string): Promise<void> {
    await api.delete(`/groups/${groupId}`);
  },

  async getGroupPermissions(groupId: string): Promise<any[]> {
    const response = await api.get(`/permissions/by-group/${groupId}`);
    return response.data;
  },

  async getProducts(): Promise<any[]> {
    const response = await api.get("/products");
    return response.data;
  }
};