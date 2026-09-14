import {
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom';

import {
  AccountType,
} from '../../types/enums';

import {
  AdminRole,
  type AdminRole as AdminRoleType,
} from '../../types/admin';

import {
  getStoredAccessToken,
  getStoredAccountType,
  getStoredAdminRole,
} from '../../utils/auth';

interface ProtectedRouteProps {
  allowedAccountTypes?: AccountType[];
  requiredAdminRole?: AdminRoleType;
}

/**
 * Redirect the user to the dashboard that matches
 * their current account.
 */
function getDashboardRoute(
  accountType: AccountType,
  adminRole: AdminRoleType | null
): string {
  switch (accountType) {
    case AccountType.Company:
      return '/company/jobs';

    case AccountType.Admin:
      return adminRole === AdminRole.SuperAdmin
        ? '/super-admin'
        : '/admin';

    case AccountType.Customer:
    default:
      return '/home';
  }
}

export default function ProtectedRoute({
  allowedAccountTypes,
  requiredAdminRole,
}: ProtectedRouteProps) {
  const location =
    useLocation();

  const accessToken =
    getStoredAccessToken();

  const accountType =
    getStoredAccountType();

  const adminRole =
    getStoredAdminRole();

  /*
   * No authenticated session.
   */
  if (
    !accessToken ||
    accountType === null
  ) {
    return (
      <Navigate
        to="/"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  /*
   * The user's account type is not allowed
   * to access this route.
   */
  if (
    allowedAccountTypes &&
    !allowedAccountTypes.includes(
      accountType
    )
  ) {
    return (
      <Navigate
        to={getDashboardRoute(
          accountType,
          adminRole
        )}
        replace
      />
    );
  }

  /*
   * If this route requires an AdminRole,
   * make sure the user is actually an Admin
   * account and has sufficient privileges.
   *
   * AdminRole.Admin:
   *   Admin        -> allowed
   *   SuperAdmin   -> allowed
   *
   * AdminRole.SuperAdmin:
   *   Admin        -> blocked
   *   SuperAdmin   -> allowed
   */
  if (
    requiredAdminRole !==
    undefined
  ) {
    /*
     * Only AccountType.Admin can have
     * an AdminRole.
     */
    if (
      accountType !==
      AccountType.Admin
    ) {
      return (
        <Navigate
          to={getDashboardRoute(
            accountType,
            adminRole
          )}
          replace
        />
      );
    }

    /*
     * A missing AdminRole is not valid
     * for an Admin account.
     */
    if (adminRole === null) {
      return (
        <Navigate
          to="/admin"
          replace
        />
      );
    }

    /*
     * Normal Admin routes accept both
     * Admin and SuperAdmin.
     */
    if (
      requiredAdminRole ===
      AdminRole.Admin
    ) {
      if (
        adminRole !==
          AdminRole.Admin &&
        adminRole !==
          AdminRole.SuperAdmin
      ) {
        return (
          <Navigate
            to="/admin"
            replace
          />
        );
      }
    }

    /*
     * Super Admin routes require the
     * SuperAdmin role specifically.
     */
    if (
      requiredAdminRole ===
      AdminRole.SuperAdmin &&
      adminRole !==
        AdminRole.SuperAdmin
    ) {
      return (
        <Navigate
          to="/admin"
          replace
        />
      );
    }
  }

  return <Outlet />;
}