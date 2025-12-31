const API_BASE_URL = 'http://localhost:4000';

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

export const productsApi = {
  // GET - שליפת כל המוצרים
  getAllProducts: async (): Promise<ProductDto[]> => {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },
  getProductsByPath: async (path: string): Promise<ProductDto[]> => {
    const response = await fetch(`${API_BASE_URL}/products/by-path/${encodeURIComponent(path)}`);
    if (!response.ok) throw new Error('Failed to fetch products by path');
    return response.json();
  },

  // POST - הוספת מוצר חדש
  createProduct: async (product: Omit<ProductDto, '_id' | 'createdAt' | 'updatedAt'>): Promise<ProductDto> => {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (!response.ok) throw new Error('Failed to create product');
    return response.json();
  },
};