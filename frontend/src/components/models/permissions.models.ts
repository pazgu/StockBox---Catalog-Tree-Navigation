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

