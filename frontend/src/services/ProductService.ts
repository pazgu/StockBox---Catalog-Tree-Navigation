import { environment } from "./../environments/environment.development";

export interface ProductDto {
  _id?: string;
  productName: string;
  productImage?: string;
  productDescription?: string;
  productPath: string;
  customFields?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateProductPayload = {
  productName: string;
  productPath: string;
  productDescription?: string;
  customFields?: Record<string, any>;
  imageFile?: File;
};

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
      body: fd,
    });

    if (!response.ok) throw new Error("Failed to create product");
    return response.json();
  }
}
