export interface DisplayItem {
  id: string;
  name: string;
  images: string | string[]; 
  type: "product" | "category";
  path: Array<string>;
  favorite?: boolean;
  description?: string;
  customFields?: any;
}