import { useEffect, useState } from 'react';
import { apiRequest } from '../../utils/api';

export default function ApiPhoto({ path, alt }: { path: string; alt: string }) {
  const [photo, setPhoto] = useState<{ path: string; url: string } | null>(null);
  const [failedPath, setFailedPath] = useState<string | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    let url: string | undefined;
    apiRequest<Blob>(path, { signal: controller.signal }).then(blob => {
      if (controller.signal.aborted) return;
      url = URL.createObjectURL(blob);
      setPhoto({ path, url });
    }).catch(() => { if (!controller.signal.aborted) setFailedPath(path); });
    return () => { controller.abort(); if (url) URL.revokeObjectURL(url); };
  }, [path]);
  if (photo?.path === path) return <img src={photo.url} alt={alt} loading="lazy" />;
  return <span className="photo-placeholder" role="status">{failedPath === path ? 'Photo unavailable' : 'Loading photo…'}</span>;
}
