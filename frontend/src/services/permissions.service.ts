import axios from "axios";
import { environment } from "../environments/environment.development";

const API_URL = `${environment.API_URL}/permissions`;

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const permissionsService = {
  getPermissionsByEntity: async (entityId: string) => {
    const response = await axios.get(`${API_URL}/${entityId}`, getAuthHeader());
    return response.data;
  },

  createPermission: async (
    entityType: string,
    entityId: string,
    allowedId: string
  ) => {
    return axios.post(
      API_URL,
      {
        entityType: entityType,
        entityId: entityId,
        allowed: allowedId,
      },
      getAuthHeader()
    );
  },

  deletePermission: async (permissionId: string) => {
    return axios.delete(`${API_URL}/${permissionId}`, getAuthHeader());
  },

  getPotentialViewers: async () => {
    const [users, groups] = await Promise.all([
      axios.get(`${environment.API_URL}/users?role=viewer`, getAuthHeader()),
      axios.get(`${environment.API_URL}/groups`, getAuthHeader()),
    ]);
    return { users: users.data, groups: groups.data };
  },

  getEntityDetails: async (type: "category" | "product", entityId: string) => {
    const cleanId = entityId.startsWith(":") ? entityId.slice(1) : entityId;

    const endpoint = type === "category" ? "categories" : "products";

    const response = await axios.get(
      `${environment.API_URL}/${endpoint}/${cleanId}`,
      getAuthHeader()
    );

    const data = response.data;

    return {
      _id: data._id,
      name: data.categoryName || data.productName || data.name,
      image:
        Array.isArray(data.productImages) && data.productImages.length > 0
          ? data.productImages[0]
          : data.categoryImage || "/placeholder-image.png",
    };
  },
};
