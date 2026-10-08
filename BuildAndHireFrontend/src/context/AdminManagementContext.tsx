/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, type ReactNode } from 'react';
import { apiRequest } from '../utils/api';
import { getStoredAccountType, getStoredAdminRole } from '../utils/auth';
import { AccountType, type AccountStatus } from '../types/enums';
import { AdminRole, type Admin } from '../types/admin';
import { useApiResource, dataChanged } from '../hooks/useApiResource';
import { useSession } from '../hooks/useSession';
interface AdminInput { userName: string; email: string; password?: string; status: AccountStatus; adminRole: AdminRole; }
interface AdminManagementContextValue {
  admins: Admin[]; loading: boolean; error: string; refreshAdmins: () => void;
  createAdmin: (input: AdminInput & { password: string }) => Promise<Admin>;
  updateAdmin: (id: string, input: AdminInput) => Promise<void>;
  deleteAdmin: (id: string) => Promise<void>;
  getAdminById: (id: string) => Admin | undefined;
}
const AdminManagementContext = createContext<AdminManagementContextValue | undefined>(undefined);
export function AdminManagementProvider({ children }: { children: ReactNode }) {
  useSession();
  const resource = useApiResource<Admin[]>('/api/Admin', getStoredAccountType() === AccountType.Admin && getStoredAdminRole() === AdminRole.SuperAdmin);
  const admins = resource.data ?? [];
  const createAdmin = async (input: AdminInput & { password: string }) => { const admin = await apiRequest<Admin>('/api/Admin', { method: 'POST', body: JSON.stringify(input) }); dataChanged(); return admin; };
  const updateAdmin = async (id: string, input: AdminInput) => { await apiRequest(`/api/Admin/${id}`, { method: 'PUT', body: JSON.stringify(input) }); dataChanged(); };
  const deleteAdmin = async (id: string) => { await apiRequest(`/api/Admin/${id}`, { method: 'DELETE' }); dataChanged(); };
  return <AdminManagementContext.Provider value={{ admins, loading: resource.loading, error: resource.error, refreshAdmins: resource.refresh, createAdmin, updateAdmin, deleteAdmin, getAdminById: id => admins.find(a => a.adminId === id) }}>{children}</AdminManagementContext.Provider>;
}
export function useAdminManagement() { const value = useContext(AdminManagementContext); if (!value) throw new Error('AdminManagementProvider is required.'); return value; }
