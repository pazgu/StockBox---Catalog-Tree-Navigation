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
  getProductsByPath: async (path: string): Promise<ProductDto[]> => {
    const pathWithoutLeadingSlash = path.startsWith('/') ? path.substring(1) : path;     
    const url = `${API_BASE_URL}/products/by-path/${pathWithoutLeadingSlash}`;    
    const response = await fetch(url);
    if (!response.ok) {throw new Error('Failed to fetch products by path');}
    const data = await response.json();
    return data;
  },
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