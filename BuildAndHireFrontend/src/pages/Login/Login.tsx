import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import AuthLayout from '../AuthLayout/AuthLayout';
import styles from './Login.module.css';
import type { LoginFormValues, LoginFormErrors } from './login.types';

import {
  login,
  getPostLoginRoute,
  InvalidCredentialsError,
} from '../../utils/auth';

const INITIAL_VALUES: LoginFormValues = {
  email: '',
  password: '',
  rememberMe: false,
};

function validate(values: LoginFormValues): LoginFormErrors {
  const errors: LoginFormErrors = {};

  if (!values.email.trim()) {
    errors.email = 'Email address is required.';
  } else if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)
  ) {
    errors.email = 'Enter a valid email address.';
  }

  if (!values.password) {
    errors.password = 'Password is required.';
  }

  return errors;
}

export default function Login() {
  const navigate = useNavigate();

  const [values, setValues] =
    useState<LoginFormValues>(INITIAL_VALUES);

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

    setValues((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : value,
    }));

    // Clear the general login error once
    // the user starts changing the form again.
    if (submitError) {
      setSubmitError('');
    }

    // Clear field-specific error while typing.
    if (
      name === 'email' &&
      errors.email
    ) {
      setErrors((prev) => ({
        ...prev,
        email: undefined,
      }));
    }

    if (
      name === 'password' &&
      errors.password
    ) {
      setErrors((prev) => ({
        ...prev,
        password: undefined,
      }));
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    setSubmitError('');

    const validationErrors = validate(values);

    setErrors(validationErrors);

    if (
      Object.keys(validationErrors).length > 0
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await login(
        values.email.trim(),
        values.password
      );

      const destination =
        getPostLoginRoute(
          response.accountType
        );

      navigate(destination, {
        replace: true,
      });
    } catch (error: unknown) {
      if (
        error instanceof InvalidCredentialsError
      ) {
        setSubmitError(
          'Invalid email or password.'
        );
      } else if (
        error instanceof Error
      ) {
        setSubmitError(error.message);
      } else {
        setSubmitError(
          'Unable to sign you in. Please try again.'
        );
      }
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
              aria-describedby={
                errors.email
                  ? 'email-error'
                  : undefined
              }
              autoComplete="email"
              disabled={isSubmitting}
            />

            {errors.email && (
              <p
                id="email-error"
                className={styles.errorText}
              >
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
              aria-describedby={
                errors.password
                  ? 'password-error'
                  : undefined
              }
              autoComplete="current-password"
              disabled={isSubmitting}
            />

            {errors.password && (
              <p
                id="password-error"
                className={styles.errorText}
              >
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