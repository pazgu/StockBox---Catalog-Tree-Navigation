import { Types } from 'mongoose';

export class GroupResponseDto {
  id: string;
  groupName: string;
  members: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  }[];
}

export interface PopulatedMember {
  _id: Types.ObjectId;
  username: string;
  firstName: string;
  lastName: string;
}
