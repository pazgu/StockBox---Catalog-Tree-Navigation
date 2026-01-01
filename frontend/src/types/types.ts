export const USER_ROLES = ["editor", "viewer"] as const;

export type UserRole = (typeof USER_ROLES)[number];

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

export interface User {
  _id?: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  approved?: boolean;
  role: UserRole;
  requestSent?: boolean;
  isBlocked?: boolean;

}
export interface Group {
  id: string;
  name: string;
  members: string[];
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


export interface AccordionData {
  id: string; 
  title: string;
  content: string;
  isEditable: boolean; 
}
export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
}

export interface FileFolder {
  id: string;
  name: string;
  files: UploadedFile[];
}

export type AddCategoryResult = {
  name: string;
  image: string;
};

export type Point = { x: number; y: number };