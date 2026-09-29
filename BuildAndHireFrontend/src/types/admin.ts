import type { AccountStatus } from './enums';

export const AdminRole = {
  Admin: 1,
  SuperAdmin: 2,
} as const;

export type AdminRole =
  (typeof AdminRole)[keyof typeof AdminRole];

export interface Admin {
  adminId: string;
  userName: string;
  email: string;
  status: AccountStatus;
  accountType: 3;
  adminRole: AdminRole;
}