export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ??
  'https://localhost:7172'
).replace(/\/$/, '');

export class ApiError extends Error {
  readonly status: number;
  constructor(message: string, status: number) { super(message); this.name = 'ApiError'; this.status = status; }
}
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

  let response: Response;
  try { response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers }); }
  catch (error) {
    if (options.signal?.aborted) throw error;
    throw new ApiError('Could not reach the server. Check your connection and try again.', 0);
  }

  if (!response.ok) {
    const problem = await response.json().catch(() => null);

    const messages =
      problem?.errors && typeof problem.errors === 'object'
        ? Object.values(problem.errors).flat().join(' ')
        : '';

    if (response.status === 401 && token && token === localStorage.getItem('buildandhire.accessToken')) {
      for (const key of ['accessToken', 'accountType', 'adminRole', 'customerId', 'companyId']) localStorage.removeItem(`buildandhire.${key}`);
      window.dispatchEvent(new Event('buildandhire:auth'));
    }
    throw new ApiError(
      messages ||
        (typeof problem === 'string' ? problem : '') ||
        problem?.message ||
        problem?.title ||
        (response.status === 401 ? 'Your session expired. Please sign in again.' : `Request failed (${response.status}).`), response.status
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (response.headers.get('Content-Type')?.includes('json')
    ? response.json()
    : response.text()) as Promise<T>;
}
