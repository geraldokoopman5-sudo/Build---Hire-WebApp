/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { apiRequest } from '../utils/api';
import { getStoredAccessToken, getStoredAccountType, getStoredAdminRole } from '../utils/auth';
import { AccountType, type AccountStatus } from '../types/enums';
import { AdminRole, type Admin } from '../types/admin';

interface CreateAdminInput {
  userName: string;
  email: string;
  password: string;
  status: AccountStatus;
  adminRole: AdminRole;
}
interface UpdateAdminInput {
  userName: string;
  email: string;
  password?: string;
  status: AccountStatus;
  adminRole: AdminRole;
}
interface AdminManagementContextValue {
  admins: Admin[];
  loading: boolean;
  error: string;
  createAdmin: (input: CreateAdminInput) => Promise<Admin>;
  updateAdmin: (adminId: string, input: UpdateAdminInput) => Promise<void>;
  deleteAdmin: (adminId: string) => Promise<void>;
  getAdminById: (adminId: string) => Admin | undefined;
}
const AdminManagementContext = createContext<AdminManagementContextValue | undefined>(undefined);

export function AdminManagementProvider({ children }: { children: ReactNode }) {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let controller: AbortController | undefined;
    const reload = () => {
      controller?.abort();
      controller = new AbortController();
      setAdmins([]);
      if (!getStoredAccessToken() || getStoredAccountType() !== AccountType.Admin ||
          getStoredAdminRole() !== AdminRole.SuperAdmin) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const signal = controller.signal;
      apiRequest<Admin[]>('/api/Admin', { signal })
        .then(data => { if (!signal.aborted) { setAdmins(data); setError(''); } })
        .catch((reason: unknown) => { if (!signal.aborted) setError(reason instanceof Error ? reason.message : 'Could not load admins.'); })
        .finally(() => { if (!signal.aborted) setLoading(false); });
    };
    reload();
    window.addEventListener('buildandhire:auth', reload);
    window.addEventListener('storage', reload);
    return () => {
      controller?.abort();
      window.removeEventListener('buildandhire:auth', reload);
      window.removeEventListener('storage', reload);
    };
  }, []);

  const createAdmin = async (input: CreateAdminInput): Promise<Admin> => {
    const admin = await apiRequest<Admin>('/api/Admin', {
      method: 'POST', body: JSON.stringify(input),
    });
    setAdmins(current => [...current, admin]);
    return admin;
  };
  const updateAdmin = async (id: string, input: UpdateAdminInput): Promise<void> => {
    const admin = await apiRequest<Admin>(`/api/Admin/${id}`, {
      method: 'PUT', body: JSON.stringify(input),
    });
    setAdmins(current => current.map(item => item.adminId === id ? admin : item));
  };
  const deleteAdmin = async (id: string): Promise<void> => {
    await apiRequest<string>(`/api/Admin/${id}`, { method: 'DELETE' });
    setAdmins(current => current.filter(item => item.adminId !== id));
  };
  const getAdminById = useCallback((id: string) => admins.find(admin => admin.adminId === id), [admins]);
  const value = useMemo(() => ({ admins, loading, error, createAdmin, updateAdmin, deleteAdmin, getAdminById }),
    [admins, loading, error, getAdminById]);
  return <AdminManagementContext.Provider value={value}>{children}</AdminManagementContext.Provider>;
}

export function useAdminManagement(): AdminManagementContextValue {
  const context = useContext(AdminManagementContext);
  if (!context) throw new Error('useAdminManagement must be used inside AdminManagementProvider');
  return context;
}
