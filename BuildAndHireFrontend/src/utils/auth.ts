import { AccountType } from '../types/enums';
 
/**
 * Base URL of the BuildAndHire.API backend.
 * Set VITE_API_BASE_URL in a .env file once the backend is running
 * (e.g. VITE_API_BASE_URL=https://localhost:7123). Falls back to a
 * typical local ASP.NET Core dev port.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:7123';
 
/**
 * Shape of the login response coming back from JwtService.AuthenticateUser.
 * The backend returns different DTOs (Company/Customer/Admin) depending on
 * account type, but they all extend LoginresponseDto, so we only require
 * the shared fields here and keep the rest loose.
 */
export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
  accountType: (typeof AccountType)[keyof typeof AccountType];
  [key: string]: unknown;
}
 
export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid email or password.');
    this.name = 'InvalidCredentialsError';
  }
}
 
const TOKEN_STORAGE_KEY = 'buildandhire.accessToken';
const ACCOUNT_TYPE_STORAGE_KEY = 'buildandhire.accountType';
 
/**
 * Calls the real backend login endpoint (AuthController -> POST /api/auth/login).
 * Throws InvalidCredentialsError on a 401, or a generic Error for anything else
 * (network failure, unexpected server error, etc.) so the caller can show the
 * right message.
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  let response: Response;
 
  try {
    response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new Error('Could not reach the server. Please check your connection and try again.');
  }
 
  if (response.status === 401) {
    throw new InvalidCredentialsError();
  }
 
  if (!response.ok) {
    throw new Error('Something went wrong signing you in. Please try again.');
  }
 
  const data = (await response.json()) as LoginResponse;
 
  localStorage.setItem(TOKEN_STORAGE_KEY, data.accessToken);
  localStorage.setItem(ACCOUNT_TYPE_STORAGE_KEY, String(data.accountType));
 
  return data;
}
 
/** Where to send a user immediately after a successful login, by account type. */
export function getPostLoginRoute(accountType: LoginResponse['accountType']): string {
  switch (accountType) {
    case AccountType.Company:
      return '/company/jobs';
    case AccountType.Admin:
      return '/admin';
    case AccountType.Customer:
    default:
      return '/home';
  }
}
 
export function getStoredAccessToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}
 
export function logout(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(ACCOUNT_TYPE_STORAGE_KEY);
}