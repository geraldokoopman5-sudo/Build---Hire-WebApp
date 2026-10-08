import { useSyncExternalStore } from 'react';
const subscribe = (callback: () => void) => {
  window.addEventListener('buildandhire:auth', callback);
  window.addEventListener('storage', callback);
  return () => { window.removeEventListener('buildandhire:auth', callback); window.removeEventListener('storage', callback); };
};
const snapshot = () => ['accessToken', 'accountType', 'adminRole'].map(k => localStorage.getItem(`buildandhire.${k}`) ?? '').join('|');
export function useSession() { return useSyncExternalStore(subscribe, snapshot); }
