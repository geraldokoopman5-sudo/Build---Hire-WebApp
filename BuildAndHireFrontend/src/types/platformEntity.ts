import { AccountStatus } from './enums';

export interface PlatformCompany {
  id: string;
  name: string;
  initials: string;
  location: string;
  status: AccountStatus;
  isFlagged: boolean;
  totalProjects: number;
  joinedDate: string;
}

export interface PlatformCustomer {
  id: string;
  name: string;
  initials: string;
  location: string;
  status: AccountStatus;
  isFlagged: boolean;
  totalJobsPosted: number;
  joinedDate: string;
}