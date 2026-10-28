import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShaderAnimeFire } from '../../components/ShaderAnimeFire/ShaderAnimeFire';
import { getStoredAccountType, getStoredAdminRole, getPostLoginRoute } from '../../utils/auth';
import { AccountType } from '../../types/enums';
import styles from './NotFound.module.css';
export default function NotFound() {
  const type = getStoredAccountType();
  const workspace = type ? getPostLoginRoute(type, getStoredAdminRole()) : '/';
  const [paused, setPaused] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = '404 — Page not found | Build & Hire';
    heading.current?.focus({ preventScroll: true });
    return () => { document.title = previousTitle; };
  }, []);

  return (
    <div className={styles.page}>
      <ShaderAnimeFire theme="dark" height={0.38} speed={paused ? 0 : 0.6} interactive={!paused} />
      <div className={styles.scrim} aria-hidden="true" />
      <header className={styles.header}>
        <Link className={styles.brand} to={workspace} aria-label="Build and Hire home">
          Build<span>&amp;</span>Hire<span className={styles.brandDot}>.</span>
        </Link>
        <button className={styles.motionToggle} type="button" aria-pressed={paused}
          onClick={() => setPaused(value => !value)}>
          {paused ? 'Resume flames' : 'Pause flames'}
        </button>
      </header>
      <main className={styles.content} aria-labelledby="not-found-title">
        <p className={styles.eyebrow}>A LITTLE OFF THE BLUEPRINT</p>
        <div className={styles.code} aria-hidden="true">404</div>
        <h1 ref={heading} tabIndex={-1} id="not-found-title" className={styles.title}>
          This page isn’t on the plan.
        </h1>
        <p className={styles.description}>
          Looks like this link went up in smoke.<br />
          Let’s get you back to building something great.
        </p>
        <div className={styles.actions}>
          <Link className={styles.primary} to={workspace}>
            {type ? 'Back to workspace' : 'Go to sign in'} <span aria-hidden="true">↗</span>
          </Link>
          {type === AccountType.Customer && (
            <Link className={styles.secondary} to="/my-jobs">My projects</Link>
          )}
        </div>
        {type && <Link className={styles.signIn} to="/">Need another account? Sign in</Link>}
      </main>
      <footer className={styles.footer}>
        <span>Build &amp; Hire</span><span>Good things are still ahead.</span>
      </footer>
    </div>
  );
}
