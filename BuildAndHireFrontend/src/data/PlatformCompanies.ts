import type { PlatformCompany } from '../types/platformEntity';
import { AccountStatus } from '../types/enums';

export const platformCompanies: PlatformCompany[] = [
  {
    id: 'terraform-homes',
    name: 'Terraform Homes',
    initials: 'TH',
    location: 'San Francisco, CA',
    status: AccountStatus.Active,
    isFlagged: false,
    totalProjects: 142,
    joinedDate: 'Oct 12, 2023',
  },
  {
    id: 'oak-and-crane',
    name: 'Oak & Crane',
    initials: 'OC',
    location: 'Austin, TX',
    status: AccountStatus.Pending,
    isFlagged: false,
    totalProjects: 8,
    joinedDate: 'Jan 05, 2024',
  },
  {
    id: 'buildsmart-inc',
    name: 'BuildSmart Inc.',
    initials: 'BS',
    location: 'Chicago, IL',
    status: AccountStatus.Active,
    isFlagged: true,
    totalProjects: 56,
    joinedDate: 'Nov 28, 2022',
  },
];