import { AccountType } from '../types/enums';
import {
  AdminRole,
  type AdminRole as AdminRoleType,
} from '../types/admin';

/**
 * Base URL of the BuildAndHire.API backend.
 * This is still used by the real API login function when
 * backend authentication is enabled.
 */
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  'https://localhost:7123';

/**
 * Shape of the login response returned by the backend.
 *
 * AdminRole is optional because Customer and Company
 * accounts do not have an admin role.
 */
export interface LoginResponse {
  accessToken: string;
  expiresIn: number;

  accountType:
    (typeof AccountType)[keyof typeof AccountType];

  adminRole?: AdminRoleType | null;

  [key: string]: unknown;
}

export class InvalidCredentialsError
  extends Error {
  constructor() {
    super('Invalid email or password.');
    this.name =
      'InvalidCredentialsError';
  }
}

const TOKEN_STORAGE_KEY =
  'buildandhire.accessToken';

const ACCOUNT_TYPE_STORAGE_KEY =
  'buildandhire.accountType';

const ADMIN_ROLE_STORAGE_KEY =
  'buildandhire.adminRole';

/**
 * Calls the real backend login endpoint.
 *
 * This remains here so we can switch from the
 * frontend development login to the real API
 * later without changing the rest of the app.
 */
export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}/api/auth/login`,
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',
        },

        body: JSON.stringify({
          email,
          password,
        }),
      }
    );
  } catch {
    throw new Error(
      'Could not reach the server. Please check your connection and try again.'
    );
  }

  if (response.status === 401) {
    throw new InvalidCredentialsError();
  }

  if (!response.ok) {
    throw new Error(
      'Something went wrong signing you in. Please try again.'
    );
  }

  const data =
    (await response.json()) as LoginResponse;

  localStorage.setItem(
    TOKEN_STORAGE_KEY,
    data.accessToken
  );

  localStorage.setItem(
    ACCOUNT_TYPE_STORAGE_KEY,
    String(data.accountType)
  );

  /*
   * Only Admin accounts have an AdminRole.
   */
  if (
    data.accountType ===
      AccountType.Admin &&
    data.adminRole !== undefined &&
    data.adminRole !== null
  ) {
    localStorage.setItem(
      ADMIN_ROLE_STORAGE_KEY,
      String(data.adminRole)
    );
  } else {
    localStorage.removeItem(
      ADMIN_ROLE_STORAGE_KEY
    );
  }

  return data;
}

/**
 * Determines where an authenticated user
 * should be sent after login.
 *
 * Super Admin is still an Admin account.
 * The AdminRole determines whether they go
 * to the normal Admin Portal or Super Admin area.
 */
export function getPostLoginRoute(
  accountType: LoginResponse['accountType'],
  adminRole:
    | AdminRoleType
    | null
    | undefined = null
): string {
  switch (accountType) {
    case AccountType.Company:
      return '/company/jobs';

    case AccountType.Admin:
      if (
        adminRole ===
        AdminRole.SuperAdmin
      ) {
        return '/super-admin';
      }

      return '/admin';

    case AccountType.Customer:
    default:
      return '/home';
  }
}

/**
 * Returns the currently stored access token.
 */
export function getStoredAccessToken():
  string | null {
  return localStorage.getItem(
    TOKEN_STORAGE_KEY
  );
}

/**
 * Returns the stored account type.
 */
export function getStoredAccountType():
  | AccountType
  | null {
  const value =
    localStorage.getItem(
      ACCOUNT_TYPE_STORAGE_KEY
    );

  if (value === null) {
    return null;
  }

  const accountType =
    Number(value);

  if (
    accountType ===
      AccountType.Customer ||
    accountType ===
      AccountType.Company ||
    accountType ===
      AccountType.Admin
  ) {
    return accountType;
  }

  return null;
}

/**
 * Returns the stored AdminRole.
 *
 * Customers and Companies return null.
 */
export function getStoredAdminRole():
  | AdminRoleType
  | null {
  const value =
    localStorage.getItem(
      ADMIN_ROLE_STORAGE_KEY
    );

  if (value === null) {
    return null;
  }

  const role = Number(value);

  if (
    role === AdminRole.Admin ||
    role === AdminRole.SuperAdmin
  ) {
    return role;
  }

  return null;
}

/**
 * Clears the complete frontend authentication
 * session.
 */
export function logout(): void {
  localStorage.removeItem(
    TOKEN_STORAGE_KEY
  );

  localStorage.removeItem(
    ACCOUNT_TYPE_STORAGE_KEY
  );

  localStorage.removeItem(
    ADMIN_ROLE_STORAGE_KEY
  );
}