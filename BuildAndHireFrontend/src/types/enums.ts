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

export const PaymentMethod = {
  EFT: 0,
  Cash: 1,
  Payshap: 2,
  Paypal: 3,
  DebitOrCreditCard: 4,
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const PaymentEnum = {
  Pending: 1,
  Successful: 2,
  Failed: 3,
  Refunded: 4,
} as const;

export type PaymentEnum = (typeof PaymentEnum)[keyof typeof PaymentEnum];