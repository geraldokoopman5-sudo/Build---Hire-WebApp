/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, type ReactNode } from 'react';
import { useApiResource } from '../hooks/useApiResource';
import { useSession } from '../hooks/useSession';
import { getStoredAccessToken } from '../utils/auth';
import { apiRequest } from '../utils/api';

interface Profile {
  accountId: string;
  displayName: string;
  email: string;
  photoDataUrl: string | null;
}
interface ProfileContextValue {
  profile: Profile | null;
  loading: boolean;
  error: string;
  refresh: () => void;
  uploadPhoto: (file: File) => Promise<void>;
  removePhoto: () => Promise<void>;
}
const ProfileContext = createContext<ProfileContextValue | null>(null);
export function ProfileProvider({ children }: { children: ReactNode }) {
  useSession();
  const resource = useApiResource<Profile>('/api/Profile', !!getStoredAccessToken());
  const uploadPhoto = async (file: File) => {
    const form = new FormData(); form.append('photo', file);
    await apiRequest('/api/Profile/photo', { method: 'PUT', body: form });
    resource.refresh();
  };
  const removePhoto = async () => {
    await apiRequest('/api/Profile/photo', { method: 'DELETE' });
    resource.refresh();
  };
  return <ProfileContext.Provider value={{ profile: resource.data, loading: resource.loading, error: resource.error,
    refresh: resource.refresh, uploadPhoto, removePhoto }}>{children}</ProfileContext.Provider>;
}
export function useProfile() {
  const value = useContext(ProfileContext);
  if (!value) throw new Error('ProfileProvider is required.');
  return value;
}
