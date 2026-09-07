import type { PlatformCustomer } from '../types/platformEntity';
import { AccountStatus } from '../types/enums';

export const platformCustomers: PlatformCustomer[] = [
  {
    id: 'john-doe',
    name: 'John Doe',
    initials: 'JD',
    location: 'Denver, CO',
    status: AccountStatus.Active,
    isFlagged: false,
    totalJobsPosted: 4,
    joinedDate: 'Feb 18, 2024',
  },
  {
    id: 'maria-lopez',
    name: 'Maria Lopez',
    initials: 'ML',
    location: 'Miami, FL',
    status: AccountStatus.Active,
    isFlagged: false,
    totalJobsPosted: 1,
    joinedDate: 'Mar 02, 2024',
  },
  {
    id: 'kevin-park',
    name: 'Kevin Park',
    initials: 'KP',
    location: 'Seattle, WA',
    status: AccountStatus.InActive,
    isFlagged: true,
    totalJobsPosted: 12,
    joinedDate: 'Jul 22, 2023',
  },
];