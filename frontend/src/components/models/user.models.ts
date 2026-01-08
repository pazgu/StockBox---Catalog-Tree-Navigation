export const USER_ROLES = ["editor", "viewer"] as const;

export type UserRole = (typeof USER_ROLES)[number];

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