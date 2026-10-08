export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ??
  'https://localhost:7172'
).replace(/\/$/, '');

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  const token = localStorage.getItem('buildandhire.accessToken');
  if (token && !token.startsWith('dev-token-') && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const problem = await response.json().catch(() => null);

    const messages =
      problem?.errors && typeof problem.errors === 'object'
        ? Object.values(problem.errors).flat().join(' ')
        : '';

    throw new Error(
      messages ||
        (typeof problem === 'string' ? problem : '') ||
        problem?.message ||
        problem?.title ||
        `Request failed (${response.status}).`
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (response.headers.get('Content-Type')?.includes('json')
    ? response.json()
    : response.text()) as Promise<T>;
}
