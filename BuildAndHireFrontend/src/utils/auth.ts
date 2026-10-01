import { AccountType } from '../types/enums';
import {
  AdminRole,
  type AdminRole as AdminRoleType,
} from '../types/admin';

import { API_BASE_URL } from './api';

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
 * Stores the authenticated session returned by the API.
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

  localStorage.setItem('buildandhire.customerId', typeof data.customerId === 'string' ? data.customerId : '');
  window.dispatchEvent(new Event('buildandhire:auth'));
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
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  return token?.startsWith('dev-token-') ? null : token;
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
  localStorage.removeItem('buildandhire.customerId');
  localStorage.removeItem(
    TOKEN_STORAGE_KEY
  );

  localStorage.removeItem(
    ACCOUNT_TYPE_STORAGE_KEY
  );

  localStorage.removeItem(
    ADMIN_ROLE_STORAGE_KEY
  );
  window.dispatchEvent(new Event('buildandhire:auth'));
}
