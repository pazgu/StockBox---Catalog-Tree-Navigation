import { environment } from "./../environments/environment.development";

export interface ProductDto {
  _id?: string;
  productName: string;
  productImage: string;
  productDescription?: string;
  productPath: string;
  customFields?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export class ProductsService {
  private static readonly baseUrl = `${environment.API_URL}/products`;

  static async getProductsByPath(path: string): Promise<ProductDto[]> {
    const cleanPath = path.startsWith('/') ? path.substring(1) : path; 
    const url = `${this.baseUrl}/by-path/${cleanPath}`; 
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  }

  static async createProduct(product: Omit<ProductDto, '_id' | 'createdAt' | 'updatedAt'>): Promise<ProductDto> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (!response.ok) throw new Error('Failed to create product');
    return response.json();
  }
}