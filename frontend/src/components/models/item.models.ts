export interface DisplayItem {
  id: string;
  name: string;
  image: string;
  type: "product" | "category";
  path: Array<string>;
  favorite?: boolean;
  description?: string;
  customFields?: any;
}
