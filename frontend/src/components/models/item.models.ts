import { CategoryImageDTO } from "./category.models";

export interface DisplayItem {
  id: string;
  name: string;
  images: string | string[] | CategoryImageDTO; 
  type: "product" | "category";
  path: Array<string>;
  favorite?: boolean;
  description?: string;
  customFields?: any;
}