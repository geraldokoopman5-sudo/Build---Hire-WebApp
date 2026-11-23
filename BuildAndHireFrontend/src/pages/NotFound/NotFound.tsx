import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getStoredAccountType, getStoredAdminRole, getPostLoginRoute } from '../../utils/auth';
import { AccountType } from '../../types/enums';
import styles from './NotFound.module.css';

export default function NotFound() {
  const type = getStoredAccountType();
  const isSignedIn = type !== null;
  const workspace = isSignedIn ? getPostLoginRoute(type, getStoredAdminRole()) : '/';
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = '404 - Page not found | Build & Hire';
    heading.current?.focus({ preventScroll: true });
    return () => { document.title = previousTitle; };
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} to={workspace} aria-label="Build and Hire home">
          Build<span>&amp;</span>Hire
        </Link>
      </header>
      <main className={styles.content} aria-labelledby="not-found-title">
        <section className={styles.card}>
          <p className={styles.code} aria-hidden="true">404</p>
          <h1 ref={heading} tabIndex={-1} id="not-found-title" className={styles.title}>
            Page not found
          </h1>
          <p className={styles.description}>
            The page you are looking for may have moved or no longer exists.
            Check the address or return to {isSignedIn ? 'your workspace' : 'sign in'}.
          </p>
          <div className={styles.actions}>
            <Link className={styles.primary} to={workspace}>
              {isSignedIn ? 'Back to workspace' : 'Go to sign in'}
            </Link>
            {type === AccountType.Customer && (
              <Link className={styles.secondary} to="/my-jobs">My projects</Link>
            )}
          </div>
        </section>
      </main>
      <footer className={styles.footer}>Build &amp; Hire</footer>
    </div>
  );
}
