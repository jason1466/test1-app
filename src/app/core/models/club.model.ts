import { User } from '../models';

export interface Club {
  name: string;
  description: string;
  email: String;
  owners: User[];

  id: String;
  createdAt: Date;
  createdBy: String;
  updatedAt: Date;
  updatedBy: String;
}
