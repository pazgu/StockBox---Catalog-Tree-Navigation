
export type BannedEntityType = "product" | "category" ;

export interface BannedItem {
  id: number | string;
  name: string;
  type: BannedEntityType;
  groupId?: string;
  image?: string; 
}

export interface SearchResult {
  type: "category" | "product";
  id: string;
  label: string;
  paths: string[];
}

export interface SearchResponse {
  items: SearchResult[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export type Point = { x: number; y: number };