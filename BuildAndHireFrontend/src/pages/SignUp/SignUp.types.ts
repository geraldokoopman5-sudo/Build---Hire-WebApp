import { AccountStatus, AccountType } from '../../types/enums';

export { AccountStatus, AccountType };

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