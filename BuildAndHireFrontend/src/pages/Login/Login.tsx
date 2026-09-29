import {
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

import AuthLayout from '../AuthLayout/AuthLayout';
import styles from './Login.module.css';

import type {
  LoginFormValues,
  LoginFormErrors,
} from './login.types';

import {
  AccountType,
} from '../../types/enums';

import {
  AdminRole,
} from '../../types/admin';

import {
  getPostLoginRoute,
} from '../../utils/auth';

const INITIAL_VALUES: LoginFormValues = {
  email: '',
  password: '',
  rememberMe: false,
};

interface DevelopmentAccount {
  accountType: AccountType;
  adminRole: AdminRole | null;
}

function validate(
  values: LoginFormValues
): LoginFormErrors {
  const errors: LoginFormErrors = {};

  if (!values.email.trim()) {
    errors.email =
      'Email address is required.';
  } else if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      values.email
    )
  ) {
    errors.email =
      'Enter a valid email address.';
  }

  if (!values.password) {
    errors.password =
      'Password is required.';
  }

  return errors;
}

/*
 * FRONTEND-ONLY DEVELOPMENT LOGIN
 *
 * This will be replaced by the real API
 * authentication during backend integration.
 *
 * Development accounts:
 *
 * superadmin@buildandhire.test
 *   -> Admin account + SuperAdmin role
 *
 * admin@buildandhire.test
 *   -> Admin account + Admin role
 *
 * company@buildandhire.test
 *   -> Company account
 *
 * anything@example.com
 *   -> Customer account
 */
function getDevelopmentAccount(
  email: string
): DevelopmentAccount {
  const normalizedEmail =
    email.trim().toLowerCase();

  /*
   * Super Admin must be checked before
   * normal Admin because "superadmin"
   * also contains "admin".
   */
  if (
    normalizedEmail.includes(
      'superadmin'
    )
  ) {
    return {
      accountType:
        AccountType.Admin,

      adminRole:
        AdminRole.SuperAdmin,
    };
  }

  if (
    normalizedEmail.includes(
      'admin'
    )
  ) {
    return {
      accountType:
        AccountType.Admin,

      adminRole:
        AdminRole.Admin,
    };
  }

  if (
    normalizedEmail.includes(
      'company'
    )
  ) {
    return {
      accountType:
        AccountType.Company,

      adminRole: null,
    };
  }

  return {
    accountType:
      AccountType.Customer,

    adminRole: null,
  };
}

function createDevelopmentSession(
  account: DevelopmentAccount
): void {
  localStorage.setItem(
    'buildandhire.accessToken',
    `dev-token-${crypto.randomUUID()}`
  );

  localStorage.setItem(
    'buildandhire.accountType',
    String(account.accountType)
  );

  /*
   * Only Admin accounts need an AdminRole.
   */
  if (account.adminRole !== null) {
    localStorage.setItem(
      'buildandhire.adminRole',
      String(account.adminRole)
    );
  } else {
    /*
     * Make sure an old admin role does not
     * remain when switching to another account.
     */
    localStorage.removeItem(
      'buildandhire.adminRole'
    );
  }
}

export default function Login() {
  const navigate = useNavigate();

  const [values, setValues] =
    useState<LoginFormValues>(
      INITIAL_VALUES
    );

  const [errors, setErrors] =
    useState<LoginFormErrors>({});

  const [submitError, setSubmitError] =
    useState<string>('');

  const [isSubmitting, setIsSubmitting] =
    useState<boolean>(false);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setValues((current) => ({
      ...current,
      [name]:
        type === 'checkbox'
          ? checked
          : value,
    }));

    setSubmitError('');

    setErrors((current) => ({
      ...current,
      [name]: undefined,
    }));
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ): void => {
    event.preventDefault();

    setSubmitError('');

    const validationErrors =
      validate(values);

    setErrors(validationErrors);

    if (
      Object.keys(validationErrors).length > 0
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      const account =
        getDevelopmentAccount(
          values.email
        );

      createDevelopmentSession(account);

      const destination =
        getPostLoginRoute(
          account.accountType,
          account.adminRole
        );

      navigate(destination, {
        replace: true,
      });
    } catch {
      setSubmitError(
        'Unable to sign you in. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className={styles.card}>
        <h2 className={styles.title}>
          Welcome Back
        </h2>

        <p className={styles.subtitle}>
          Experience conscious living once again.
        </p>

        {submitError && (
          <div
            className={styles.errorText}
            role="alert"
          >
            {submitError}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          noValidate
        >
          <div className={styles.field}>
            <label
              htmlFor="email"
              className={styles.label}
            >
              Email Address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="hello@example.com"
              value={values.email}
              onChange={handleChange}
              className={`${styles.input} ${
                errors.email
                  ? styles.inputError
                  : ''
              }`}
              aria-invalid={Boolean(
                errors.email
              )}
              autoComplete="email"
              disabled={isSubmitting}
            />

            {errors.email && (
              <p className={styles.errorText}>
                {errors.email}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label
              htmlFor="password"
              className={styles.label}
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={values.password}
              onChange={handleChange}
              className={`${styles.input} ${
                errors.password
                  ? styles.inputError
                  : ''
              }`}
              aria-invalid={Boolean(
                errors.password
              )}
              autoComplete="current-password"
              disabled={isSubmitting}
            />

            {errors.password && (
              <p className={styles.errorText}>
                {errors.password}
              </p>
            )}
          </div>

          <div className={styles.rowBetween}>
            <label
              className={styles.checkboxLabel}
            >
              <input
                type="checkbox"
                name="rememberMe"
                checked={values.rememberMe}
                onChange={handleChange}
                disabled={isSubmitting}
              />

              Remember me
            </label>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Signing in…'
              : 'Sign In'}
          </button>
        </form>

        <p className={styles.footerText}>
          Don&apos;t have an account?{' '}

          <Link
            to="/signup"
            className={styles.footerLink}
          >
            Sign up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}