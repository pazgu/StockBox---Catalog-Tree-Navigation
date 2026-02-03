import { environment } from "../environments/environment.development";
import api from "./axios";

const API_URL = `${environment.API_URL}/permissions`;

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const permissionsService = {
  getPermissionsByEntity: async (entityId: string) => {
    const response = await api.get(`${API_URL}/${entityId}`, getAuthHeader());
    return response.data;
  },

  createPermission(
    entityType: string,
    entityId: string,
    allowedId: string,
    inheritToChildren?: boolean,
    contextPath?: string
  ) {
    return api.post(
      API_URL,
      {
        entityType,
        entityId,
        allowed: allowedId,
        inheritToChildren,
        contextPath
      },
      getAuthHeader(),
    );
  },

  createPermissionsBatch: async (
    permissions: Array<{
      entityType: string;
      entityId: string;
      allowed: string;
      inheritToChildren?: boolean;
      contextPath?: string;
    }>,
  ) => {
    return api.post(`${API_URL}/batch`, { permissions }, getAuthHeader());
  },

  deletePermission: async (permissionId: string) => {
    return api.delete(`${API_URL}/${permissionId}`, getAuthHeader());
  },
  deletePermissionsBatch: async (permissionIds: string[]) => {
    return api.post(
      `${API_URL}/batch-delete`,
      { permissionIds },
      getAuthHeader(),
    );
  },

  getPotentialViewers: async () => {
    const [users, groups] = await Promise.all([
      api.get(`${environment.API_URL}/users?role=viewer`, getAuthHeader()),
      api.get(`${environment.API_URL}/groups`, getAuthHeader()),
    ]);
    return { users: users.data, groups: groups.data };
  },

  getEntityDetails: async (type: "category" | "product", entityId: string) => {
    const cleanId = entityId.startsWith(":") ? entityId.slice(1) : entityId;

    const endpoint = type === "category" ? "categories" : "products";

    const response = await api.get(
      `${environment.API_URL}/${endpoint}/${cleanId}`,
      getAuthHeader(),
    );

    const data = response.data;
    return {
      _id: data._id,
      name: data.categoryName || data.productName || data.name,
      image:
        Array.isArray(data.productImages) && data.productImages.length > 0
          ? data.productImages[0]
          : data.categoryImage || "/placeholder-image.png",
      permissionsInheritedToChildren: data.permissionsInheritedToChildren || false,
    };
  },
  getBlockedItemsForGroup: async (groupId: string) => {
    const response = await api.get(
      `${API_URL}/blocked-items/${groupId}`,
      getAuthHeader(),
    );
    return response.data;
  },

  syncCategoryPermissionsToChildren(categoryId: string) {
    return api.post(
      `${API_URL}/sync-children/${categoryId}`,
      {},
      getAuthHeader(),
    );
  },
  getProductPathsWithPermissions: async (productId: string) => {
    const response = await api.get(
      `${API_URL}/product-paths/${productId}`,
      getAuthHeader(),
    );
    return response.data;
  },
};
