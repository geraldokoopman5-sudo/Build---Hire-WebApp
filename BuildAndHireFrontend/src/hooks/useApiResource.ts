import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '../utils/api';
import { getStoredAccessToken } from '../utils/auth';

/** Abort obsolete reads on account changes, refresh and unmount. Never expose another session's data. */
export function useApiResource<T>(path: string, enabled = true) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion(v => v + 1), []);
  useEffect(() => {
    let controller: AbortController;
    const load = () => {
      controller?.abort();
      controller = new AbortController();
      const { signal } = controller;
      const token = getStoredAccessToken();
      setError('');
      setData(null);
      if (!enabled) { setLoading(false); return; }
      setLoading(true);
      apiRequest<T>(path, { signal }).then(value => {
        if (!signal.aborted && token === getStoredAccessToken()) setData(value);
      }).catch((reason: unknown) => {
        if (!signal.aborted) setError(reason instanceof Error ? reason.message : 'Could not load this page.');
      }).finally(() => { if (!signal.aborted) setLoading(false); });
    };
    load();
    for (const event of ['focus', 'storage', 'buildandhire:auth', 'buildandhire:data']) window.addEventListener(event, load);
    return () => {
      controller?.abort();
      for (const event of ['focus', 'storage', 'buildandhire:auth', 'buildandhire:data']) window.removeEventListener(event, load);
    };
  }, [path, enabled, version]);
  return { data, loading, error, refresh };
}

export function dataChanged() { window.dispatchEvent(new Event('buildandhire:data')); }
