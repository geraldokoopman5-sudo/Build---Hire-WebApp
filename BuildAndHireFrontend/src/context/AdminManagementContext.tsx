/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  AccountStatus,
  AccountType,
} from '../types/enums';

import {
  AdminRole,
  type Admin,
} from '../types/admin';

const STORAGE_KEY =
  'buildandhire.adminAccounts';

interface CreateAdminInput {
  userName: string;
  email: string;
  status: AccountStatus;
  adminRole: AdminRole;
}

interface UpdateAdminInput {
  userName: string;
  email: string;
  status: AccountStatus;
  adminRole: AdminRole;
}

interface AdminManagementContextValue {
  admins: Admin[];

  createAdmin: (
    input: CreateAdminInput
  ) => Admin;

  updateAdmin: (
    adminId: string,
    input: UpdateAdminInput
  ) => void;

  deleteAdmin: (
    adminId: string
  ) => void;

  getAdminById: (
    adminId: string
  ) => Admin | undefined;
}

const AdminManagementContext =
  createContext<
    AdminManagementContextValue | undefined
  >(undefined);

function loadAdmins(): Admin[] {
  try {
    const stored =
      localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed: unknown =
      JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as Admin[];
  } catch {
    return [];
  }
}

export function AdminManagementProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [admins, setAdmins] =
    useState<Admin[]>(loadAdmins);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(admins)
    );
  }, [admins]);

  const createAdmin = (
    input: CreateAdminInput
  ): Admin => {
    const admin: Admin = {
      adminId: crypto.randomUUID(),
      userName: input.userName.trim(),
      email: input.email.trim().toLowerCase(),
      status: input.status,
      accountType: AccountType.Admin,
      adminRole: input.adminRole,
    };

    setAdmins((current) => [
      ...current,
      admin,
    ]);

    return admin;
  };

  const updateAdmin = (
    adminId: string,
    input: UpdateAdminInput
  ): void => {
    setAdmins((current) =>
      current.map((admin) =>
        admin.adminId === adminId
          ? {
              ...admin,
              userName:
                input.userName.trim(),
              email:
                input.email.trim().toLowerCase(),
              status: input.status,
              adminRole: input.adminRole,
            }
          : admin
      )
    );
  };

  const deleteAdmin = (
    adminId: string
  ): void => {
    setAdmins((current) =>
      current.filter(
        (admin) =>
          admin.adminId !== adminId
      )
    );
  };

  const getAdminById = useCallback(
    (adminId: string): Admin | undefined => {
      return admins.find(
        (admin) =>
          admin.adminId === adminId
      );
    },
    [admins]
  );

  const value =
    useMemo<AdminManagementContextValue>(
      () => ({
        admins,
        createAdmin,
        updateAdmin,
        deleteAdmin,
        getAdminById,
      }),
      [admins, getAdminById]
    );

  return (
    <AdminManagementContext.Provider
      value={value}
    >
      {children}
    </AdminManagementContext.Provider>
  );
}

export function useAdminManagement():
  AdminManagementContextValue {
  const context =
    useContext(
      AdminManagementContext
    );

  if (!context) {
    throw new Error(
      'useAdminManagement must be used inside AdminManagementProvider'
    );
  }

  return context;
}
