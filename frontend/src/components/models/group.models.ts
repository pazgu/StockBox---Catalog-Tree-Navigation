import { BannedItem } from "../../types/types";

export interface Group {
  id: string;
  name: string;
  members: string[];
  permissions: string[];
  bannedItems: BannedItem[];
}

