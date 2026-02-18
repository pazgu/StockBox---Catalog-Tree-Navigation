import { environment } from "./../environments/environment.development";
import {
  CreateProductPayload,
  ProductDataDto,
  ProductDto,
  UpdateProductPayload,
} from "../components/models/product.models";
import api from "./axios";
import { AxiosError } from "axios";

export class ProductsService {
  private static readonly baseUrl = `${environment.API_URL}/products`;



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

    try {
      const { data } = await api.get<ProductDto[]>(
        `${this.baseUrl}/by-path/${cleanPath}`,
        this.getAuthHeaders(),
      );
      return data;
    } catch (error) {
      const err = error as AxiosError;
      const e: any = new Error("Failed to fetch products");
      e.status = err.response?.status;
      throw e;
    }
  }
 

    static async createProduct(
    payload: CreateProductPayload,
  ): Promise<ProductDto> {
    const fd = new FormData();
    fd.append("productName", payload.productName);
    fd.append("productPath", payload.productPath + "/" + payload.productName);

    if (payload.productDescription) {
      fd.append("productDescription", payload.productDescription);
    }

    if (payload.customFields) {
      fd.append("customFields", JSON.stringify(payload.customFields));
    }

    if (payload.imageFile) {
      fd.append("productImageFile", payload.imageFile);
    }

    try {
      const { data } = await api.post<ProductDto>(
        this.baseUrl,
        fd,
        this.getAuthHeaders(),
      );
      return data;
    } catch (error) {
      const err = error as AxiosError<any>;
      const status = err.response?.status;

      if (status === 401) throw new Error("Unauthorized - please login");
      if (status === 403)
        throw new Error("Only editors can create products");

      throw new Error(
        err.response?.data?.message || "Failed to create product",
      );
    }
  }


  static async getById(id: string): Promise<ProductDataDto> {
    const { data } = await api.get(`${environment.API_URL}/products/${id}`);
    return data;
  }

  
  static async moveProduct(
    productId: string,
    newCategoryPath: string[],
  ): Promise<{ success: boolean; message: string; product: ProductDto }> {
    try {
      const { data } = await api.post(
        `${this.baseUrl}/${productId}/move`,
        { newCategoryPath },
        this.getAuthHeaders(),
      );
      return data;
    } catch (error) {
      console.error("Error moving product:", error);
      throw error;
    }
  }

  static async duplicateProduct(
    productId: string,
    additionalCategoryPaths: string[],
  ): Promise<{ success: boolean; message: string; product: ProductDto }> {
    try {
      const response = await api.post(
        `${this.baseUrl}/${productId}/duplicate`,
        { additionalCategoryPaths },
        this.getAuthHeaders(),
      );
      return response.data;
    } catch (error) {
      console.error("Error duplicating product:", error);
      throw error;
    }
  }

  static async updateProduct(
    productId: string,
    payload: UpdateProductPayload,
  ): Promise<ProductDataDto> {
    const fd = new FormData();

    if (payload.productName) fd.append("productName", payload.productName);
    if (payload.productDescription)
      fd.append("productDescription", payload.productDescription);
    if (payload.productPath) fd.append("productPath", payload.productPath);

    const imgs = payload.productImages ?? [];
    const existing = imgs.filter((x): x is string => typeof x === "string");
    fd.append("existingProductImages", JSON.stringify(existing));

    imgs.forEach((img) => {
      if (img instanceof File) {
        fd.append("newProductImages", img);
      }
    });

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
            folder.folderName,
          );
          if (folder._id)
            fd.append(`uploadFolders[${gi}][folders][${fi}][_id]`, folder._id);

          folder.files.forEach((file, fli) => {
            if (file.file instanceof File) {
              fd.append(
                `uploadFolders[${gi}][folders][${fi}][files][${fli}][file]`,
                file.file,
              );
            } else if (file.link) {
              fd.append(
                `uploadFolders[${gi}][folders][${fi}][files][${fli}][link]`,
                file.link,
              );
            }
            if (file._id)
              fd.append(
                `uploadFolders[${gi}][folders][${fi}][files][${fli}][_id]`,
                file._id,
              );
          });
        });
      });
    }

    try {
      const { data } = await api.patch<ProductDataDto>(
        `${this.baseUrl}/${productId}`,
        fd,
        this.getAuthHeaders(),
      );
      return data;
    } catch (error) {
      const err = error as AxiosError;
      const status = err.response?.status;

      if (status === 401) throw new Error("Unauthorized - please login");
      if (status === 403)
        throw new Error("Only editors can update products");
      if (status === 404) throw new Error("Product not found");

      throw new Error("Failed to update product");
    }
  }

  static async getAllProducts(): Promise<ProductDto[]> {
    const { data } = await api.get<ProductDto[]>(
      this.baseUrl,
      this.getAuthHeaders(),
    );
    return data;
  }


static async deleteFromSpecificPaths(
  id: string,
  paths: string[],
): Promise<{ success: boolean; message: string }> {
  try {
    const { data } = await api.delete(
      `${this.baseUrl}/${id}/paths`,
      {
        ...this.getAuthHeaders(),
        data: { paths },
      },
    );
    return data;
  } catch (error) {
    const err = error as AxiosError;
    const status = err.response?.status;
    
    if (status === 401) throw new Error("Unauthorized - please login");
    if (status === 403) throw new Error("Only editors can delete products");
    if (status === 404) throw new Error("Product not found");

    throw new Error("Failed to delete product from specific paths");
  }
}
}