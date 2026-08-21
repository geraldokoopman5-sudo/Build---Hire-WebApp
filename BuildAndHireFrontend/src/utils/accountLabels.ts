import { AccountStatus, AccountType } from '../types/enums';

export function getAccountStatusLabel(status: AccountStatus): string {
  switch (status) {
    case AccountStatus.Active:
      return 'Active';
    case AccountStatus.InActive:
      return 'Inactive';
    case AccountStatus.Deleted:
      return 'Deleted';
    case AccountStatus.Pending:
      return 'Pending Approval';
    case AccountStatus.Available:
      return 'Available';
    case AccountStatus.Unavailable:
      return 'Unavailable';
    default:
      return 'Unknown';
  }
}

export function getAccountTypeLabel(accountType: AccountType): string {
  switch (accountType) {
    case AccountType.Customer:
      return 'Individual';
    case AccountType.Company:
      return 'Corporate Provider';
    case AccountType.Admin:
      return 'Administrator';
    default:
      return 'Unknown';
  }
}