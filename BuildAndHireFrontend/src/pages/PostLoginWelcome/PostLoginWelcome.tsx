import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPostLoginRoute, getStoredAccountType, getStoredAdminRole } from '../../utils/auth';
import styles from './PostLoginWelcome.module.css';

export default function PostLoginWelcome() {
  const navigate = useNavigate();
  const main = useRef<HTMLElement>(null);
  const destination = getPostLoginRoute(getStoredAccountType()!, getStoredAdminRole());
  const continueToWorkspace = useCallback(() => navigate(destination, { replace: true, state: { fromWelcome: true } }), [destination, navigate]);

  useEffect(() => {
    main.current?.focus({ preventScroll: true });
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(continueToWorkspace, reducedMotion ? 600 : 3400);
    return () => window.clearTimeout(timer);
  }, [continueToWorkspace]);

  return <main ref={main} tabIndex={-1} className={styles.page} aria-labelledby="welcome-title" data-post-login-welcome
    onKeyDown={event => { if (event.key === 'Escape') continueToWorkspace(); }}>
    <section className={styles.panel}>
      <span className={styles.eyebrow}>WELCOME TO YOUR WORKSPACE</span>
      <h1 id="welcome-title" className={styles.srOnly}>Welcome to Build and Hire</h1>
      <div className={styles.board}>
        <span aria-hidden="true">Build &amp; Hire</span>
      </div>
      <p className={styles.message}>Your next project starts here.</p>
      <div className={styles.divider} aria-hidden="true" />
      <p className={styles.status}>Opening your dashboard…</p>
    </section>
  </main>;
}
