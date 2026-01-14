import axios from "axios";
import { environment } from "./../environments/environment.development";
import {
  CreateProductPayload,
  ProductDataDto,
  ProductDto,
  UpdateProductPayload,
} from "../components/models/product.models";

export class ProductsService {
  private static readonly baseUrl = `${environment.API_URL}/products`;

  private static getAuthHeader(): HeadersInit {
    const token = localStorage.getItem("token");
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }

  static getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  static async getProductsByPath(path: string): Promise<ProductDto[]> {
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    const url = `${this.baseUrl}/by-path/${cleanPath}`;

    // Use the auth headers
    const headers = this.getAuthHeaders();

    const response = await fetch(url, headers);
    if (!response.ok) throw new Error("Failed to fetch products");

    return response.json();
  }

  static async createProduct(
    payload: CreateProductPayload
  ): Promise<ProductDto> {
    const fd = new FormData();
    fd.append("productName", payload.productName);
    console.log("from service product path:", payload.productPath);
    fd.append("productPath", payload.productPath);

    if (payload.productDescription) {
      fd.append("productDescription", payload.productDescription);
    }

    if (payload.customFields) {
      fd.append("customFields", JSON.stringify(payload.customFields));
    }

    if (payload.imageFile) {
      fd.append("productImageFile", payload.imageFile);
    }

    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: this.getAuthHeader(),
      body: fd,
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized - please login");
      }
      if (response.status === 403) {
        throw new Error("Only editors can create products");
      }
      throw new Error("Failed to create product");
    }
    return response.json();
  }

  static async getById(id: string): Promise<ProductDataDto> {
    const { data } = await axios.get(`${environment.API_URL}/products/${id}`);
    return data;
  }

  static async moveProduct(
    productId: string,
    newCategoryPath: string
  ): Promise<{ success: boolean; message: string; product: ProductDto }> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${productId}/move`,
        { newCategoryPath },
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error("Error moving product:", error);
      throw error;
    }
  }
  static async updateProduct(
    productId: string,
    payload: UpdateProductPayload
  ): Promise<ProductDataDto> {
    const fd = new FormData();
    console.log("UpdateProductPayload from service:");
    if (payload.productName) fd.append("productName", payload.productName);
    if (payload.productDescription)
      fd.append("productDescription", payload.productDescription);
    if (payload.productPath) fd.append("productPath", payload.productPath);

    if (payload.productImages && payload.productImages.length > 0) {
      payload.productImages.forEach((img, i) => {
        if (img instanceof File) {
          fd.append("newProductImages", img);
        } else {
          fd.append("existingProductImages", img);
        }
      });
    }

    if (payload.customFields) {
      fd.append("customFields", JSON.stringify(payload.customFields));
    }

    if (payload.uploadFolders) {
      payload.uploadFolders.forEach((group, gi) => {
        fd.append(`uploadFolders[${gi}][title]`, group.title);
        if (group._id) fd.append(`uploadFolders[${gi}][_id]`, group._id);

        group.folders.forEach((folder, fi) => {
          fd.append(
            `uploadFolders[${gi}][folders][${fi}][folderName]`,
            folder.folderName
          );
          if (folder._id)
            fd.append(`uploadFolders[${gi}][folders][${fi}][_id]`, folder._id);

          folder.files.forEach((file, fli) => {
            if (file.file instanceof File) {
              fd.append(
                `uploadFolders[${gi}][folders][${fi}][files][${fli}][file]`,
                file.file
              );
            } else if (file.link) {
              fd.append(
                `uploadFolders[${gi}][folders][${fi}][files][${fli}][link]`,
                file.link
              );
            }
            if (file._id)
              fd.append(
                `uploadFolders[${gi}][folders][${fi}][files][${fli}][_id]`,
                file._id
              );
          });
        });
      });
    }

    console.log("---- FormData entries ----");
    Array.from(fd.entries()).forEach(([key, value]) => {
      console.log(key, value);
    });
    console.log("---------------------------");

    const response = await fetch(`${this.baseUrl}/${productId}`, {
      method: "PATCH",
      headers: this.getAuthHeader(),
      body: fd,
    });

    if (!response.ok) {
      if (response.status === 401)
        throw new Error("Unauthorized - please login");
      if (response.status === 403)
        throw new Error("Only editors can update products");
      if (response.status === 404) throw new Error("Product not found");
      throw new Error("Failed to update product");
    }

    return response.json();
  }

  static async deleteProduct(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized - please login");
      }
      if (response.status === 403) {
        throw new Error("Only editors can delete products");
      }
      if (response.status === 404) {
        throw new Error("Product not found");
      }
      throw new Error("Failed to delete product");
    }
  }
}
