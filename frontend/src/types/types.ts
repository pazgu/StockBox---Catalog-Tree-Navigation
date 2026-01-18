
export type BannedEntityType = "product" | "category" ;

export interface BannedItem {
  id: number | string;
  name: string;
  type: BannedEntityType;
  groupId?: string;
  image?: string; 
}

export type Point = { x: number; y: number };