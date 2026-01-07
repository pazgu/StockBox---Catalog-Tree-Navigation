import axios from "axios";
import { environment } from "./../environments/environment.development";
import { CreateProductPayload, ProductDataDto, ProductDto } from "../components/models/product.models";



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

static async createProduct(payload: CreateProductPayload): Promise<ProductDto> {
  const fd = new FormData();
  fd.append("productName", payload.productName);
  console.log("from service product path:",payload.productPath)
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
  const { data } = await axios.get(
    `${environment.API_URL}/products/${id}`
  );
  return data;
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
