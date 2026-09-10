import { Navigate, Outlet, useLocation } from 'react-router-dom';

import {
  AccountType,
} from '../../types/enums';

import {
  getStoredAccessToken,
} from '../../utils/auth';

interface ProtectedRouteProps {
  allowedRoles?: AccountType[];
}

function getStoredAccountType(): AccountType | null {
  const stored = localStorage.getItem(
    'buildandhire.accountType'
  );

  if (stored === null) {
    return null;
  }

  const accountType = Number(stored);

  if (
    accountType === AccountType.Customer ||
    accountType === AccountType.Company ||
    accountType === AccountType.Admin
  ) {
    return accountType;
  }

  return null;
}

export default function ProtectedRoute({
  allowedRoles,
}: ProtectedRouteProps) {
  const location = useLocation();

  const token =
    getStoredAccessToken();

  const accountType =
    getStoredAccountType();

  /*
   * No authentication token:
   * send the user back to login.
   */
  if (!token || accountType === null) {
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
   * User is authenticated but does not
   * have permission to access this route.
   */
  if (
    allowedRoles &&
    !allowedRoles.includes(accountType)
  ) {
    switch (accountType) {
      case AccountType.Company:
        return (
          <Navigate
            to="/company/jobs"
            replace
          />
        );

      case AccountType.Admin:
        return (
          <Navigate
            to="/admin"
            replace
          />
        );

      case AccountType.Customer:
      default:
        return (
          <Navigate
            to="/home"
            replace
          />
        );
    }
  }

  return <Outlet />;
}