export const AccountStatus = {
  Active: 0,
  InActive: 1,
  Deleted: 2,
  Pending: 3,
  Available: 4,
  Unavailable: 5,
} as const;

export type AccountStatus = (typeof AccountStatus)[keyof typeof AccountStatus];

export const AccountType = {
  Customer: 1,
  Company: 2,
  Admin: 3,
} as const;

export type AccountType = (typeof AccountType)[keyof typeof AccountType];