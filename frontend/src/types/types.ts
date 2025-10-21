export type BannedEntityType = "product" | "category" | "subcategory";
export interface BannedItem {
  id: number | string;
  name: string;
  type: BannedEntityType;
  groupId?: string;
}

export const mockBannedItems: BannedItem[] = [
  { id: 1, name: "מצלמה דיגיטלית Canon EOS 250D DSLR", type: "product" },
  { id: 4, name: "מצלמה דיגיטלית ללא מראה Canon EOS R100", type: "product" },
  { id: "cat_2", name: "הקלטה", type: "category" },
  { id: "sub_cat_7", name: "עדשות EF", type: "subcategory" },
];

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  groups: string[];
}

export interface Group {
  id: string;
  name: string;
  permissions: string[];
  bannedItems: BannedItem[];
}

export interface Permission {
  id: string;
  category: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
}

export interface PermissionCategory {
  name: string;
  icon: React.ReactNode;
  permissions: Permission[];
}
