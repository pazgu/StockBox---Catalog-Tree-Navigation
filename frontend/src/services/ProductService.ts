import axios from "axios";
import { environment } from "./../environments/environment.development";
import { ProductDataDto } from "@/components/models/product.models";

export interface ProductDto {
  _id?: string;
  productName: string;
  productImages?: string[];
  productDescription?: string;
  productPath: string;
  customFields?: Array<{
    _id?: string;
    title: string;
    type: 'bullets' | 'content';
    bullets?: string[];
    content?: string;
  }>;
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

  static async getProductsByPath(path: string): Promise<ProductDto[]> {
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    const url = `${this.baseUrl}/by-path/${cleanPath}`;

    const response = await fetch(url);
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
    fd.append("productImageFile", payload.imageFile); // backend handles array
  }

  const response = await fetch(this.baseUrl, {
    method: "POST",
    body: fd,
  });

  if (!response.ok) throw new Error("Failed to create product");
  return response.json();
}

 static async getById(id: string): Promise<ProductDataDto> {
  const { data } = await axios.get(
    `${environment.API_URL}/products/${id}`
  );
  return data;
}

}
