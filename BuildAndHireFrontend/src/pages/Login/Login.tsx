import { useState, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import styles from './Login.module.css';
import type { LoginFormValues, LoginFormErrors } from './login.types.ts';

const INITIAL_VALUES: LoginFormValues = {
  email: '',
  password: '',
  rememberMe: false,
};

function validate(values: LoginFormValues): LoginFormErrors {
  const errors: LoginFormErrors = {};

  if (!values.email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!values.password) {
    errors.password = 'Password is required.';
  }

  return errors;
}

export default function Login() {
  const [values, setValues] = useState<LoginFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = event.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: replace with real sign-in request
      await new Promise((resolve) => setTimeout(resolve, 800));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.logo}>Build & Hire co</h1>
      </header>

      <main className={styles.main}>
        <div className={`${styles.decorPanel} ${styles['decorPanel--left']}`} aria-hidden="true" />
        <div className={`${styles.decorPanel} ${styles['decorPanel--right']}`} aria-hidden="true" />

        <div className={styles.card}>
          <h2 className={styles.title}>Welcome Back</h2>
          <p className={styles.subtitle}>Experience conscious living once again.</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="hello@example.com"
                value={values.email}
                onChange={handleChange}
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <p id="email-error" className={styles.errorText}>
                  {errors.email}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={values.password}
                onChange={handleChange}
                className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              {errors.password && (
                <p id="password-error" className={styles.errorText}>
                  {errors.password}
                </p>
              )}
            </div>

            <div className={styles.rowBetween}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={values.rememberMe}
                  onChange={handleChange}
                />
                Remember me
              </label>
            </div>

            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className={styles.divider}>OR CONTINUE WITH</div>

          <button type="button" className={styles.oauthButton}>
            Company
          </button>
                    <button type="button" className={styles.oauthButton}>
            Customer
          </button>

          <p className={styles.footerText}>
            Don&apos;t have an account?
            <Link to="/signup" className={styles.footerLink}>
              Sign up
            </Link>
          </p>
        </div>
      </main>

      <footer className={styles.siteFooter}>
        <span>👑 Made by Crown 2026 👑</span>
        <nav className={styles.footerNav}>
          <a   href="https://www.youtube.com/watch?v=Aq5WXmQQooo&pp=ygUJcmljayByb2xs"
             target="_blank"
               rel="noopener noreferrer"
          >Privacy Policy</a>
          <a href="https://www.youtube.com/watch?v=Aq5WXmQQooo&pp=ygUJcmljayByb2xs"
             target="_blank"
               rel="noopener noreferrer">Terms of Service</a>
          <a href="https://www.youtube.com/watch?v=Aq5WXmQQooo&pp=ygUJcmljayByb2xs"
             target="_blank"
               rel="noopener noreferrer">Contact Us</a>
        </nav>
      </footer>
    </div>
  );
}