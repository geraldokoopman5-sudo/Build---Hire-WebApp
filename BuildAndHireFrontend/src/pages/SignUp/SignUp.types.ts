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

export type SignUpRole = 'customer' | 'company';
export type SignUpStep = 'role' | 'details' | 'address';

export interface FormErrors {
  [field: string]: string;
}

export interface CustomerFormValues {
  customerName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface CompanyFormValues {
  companyName: string;
  companyEmail: string;
  password: string;
  confirmPassword: string;
  registrationNumber: string;
  taxNumber: string;
}

export interface AddressFormValues {
  streetAddress: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: string;
}

export interface AddressPayload {
  streetAddress: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: number;
}

export interface CustomerSignUpPayload {
  customerName: string;
  email: string;
  password: string;
  status: AccountStatus;
  accountType: AccountType;
  address: AddressPayload;
}

export interface CompanySignUpPayload {
  companyName: string;
  companyEmail: string;
  password: string;
  status: AccountStatus;
  account: AccountType;
  registrationNumber: string;
  taxNumber: string;
  address: AddressPayload;
}