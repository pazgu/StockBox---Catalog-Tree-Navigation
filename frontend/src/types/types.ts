export type UserRole = "editor" | "viewer";

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
  _id?: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  approved?: boolean;
  role: "editor" | "viewer";
  requestSent?: boolean;
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

export interface BannedItem {
  id: string | number;
  name: string;
  type: "product" | "category" | "subcategory";
  image?: string;
}

export interface AccordionData {
  id: string; // Unique ID for key and manipulation
  title: string;
  content: string;
  isEditable: boolean; // Flag to indicate if content is editable (like the default ones)
}
export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
}

// Folder interface
export interface FileFolder {
  id: string;
  name: string;
  files: UploadedFile[];
}
