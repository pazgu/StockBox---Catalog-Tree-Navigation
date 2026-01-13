
export type BannedEntityType = "product" | "category" | "subcategory";

export interface BannedItem {
  id: number | string;
  name: string;
  type: BannedEntityType;
  groupId?: string;
  image?: string; 
}

export const mockBannedItems: BannedItem[] = [
  { id: 1, name: "מצלמה דיגיטלית Canon EOS 250D DSLR", type: "product" },
  { id: 4, name: "מצלמה דיגיטלית ללא מראה Canon EOS R100", type: "product" },
  { id: "cat_2", name: "הקלטה", type: "category" },
  { id: "sub_cat_7", name: "עדשות EF", type: "subcategory" },
];


export type Point = { x: number; y: number };