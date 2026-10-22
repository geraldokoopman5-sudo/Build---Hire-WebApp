import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ConfirmationContext, type ConfirmationOptions, type RequestConfirmation } from '../../context/ConfirmationContext';
import ConfirmationDialog from './ConfirmationDialog';

export default function ConfirmationProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<(ConfirmationOptions & { message: string }) | null>(null);
  const pending = useRef<((confirmed: boolean) => void) | null>(null);

  const confirm: RequestConfirmation = useCallback((message, options = {}) => {
    if (pending.current) return Promise.resolve(false);
    return new Promise<boolean>(resolve => {
      pending.current = resolve;
      setRequest({ ...options, message });
    });
  }, []);

  const finish = useCallback((confirmed: boolean) => {
    const resolve = pending.current;
    pending.current = null;
    setRequest(null);
    resolve?.(confirmed);
  }, []);

  useEffect(() => {
    const cancel = () => finish(false);
    window.addEventListener('popstate', cancel);
    window.addEventListener('buildandhire:auth', cancel);
    window.addEventListener('storage', cancel);
    return () => {
      window.removeEventListener('popstate', cancel);
      window.removeEventListener('buildandhire:auth', cancel);
      window.removeEventListener('storage', cancel);
      pending.current?.(false);
      pending.current = null;
    };
  }, [finish]);

  return <ConfirmationContext.Provider value={confirm}>
    {children}
    {request && <ConfirmationDialog {...request} onConfirm={() => finish(true)} onCancel={() => finish(false)} />}
  </ConfirmationContext.Provider>;
}
