import { AccountStatus, AccountType } from './enums';

export interface Address {
  streetAddress: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: number;
}

export interface CompanyProfile {
  id: string;
  companyName: string;
  companyEmail: string;
  phone: string;
  address: Address;
  registrationNumber: string;
  taxNumber: string;
  status: AccountStatus;
  accountType: AccountType;
  category: string;
  rating: number;
  about: string;
  services: string[];
  completedProjects: number;
  certifications: string[];
  imageUrl: string;
}