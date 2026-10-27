import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SplitFlapText from '../../components/reactbits/SplitFlapText/SplitFlapText';
import { getPostLoginRoute, getStoredAccountType, getStoredAdminRole } from '../../utils/auth';
import styles from './PostLoginWelcome.module.css';

const BRAND_WORDS = ['Build and Hire'];

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
        <SplitFlapText
          words={BRAND_WORDS}
          flipDuration={0.12}
          stagger={0.06}
          cycleDelay={2400}
          charset="alphanumeric"
          flipsPerChar={8}
          order="left"
          align="left"
          tileStyle="board"
          tileColor="var(--color-secondary, #543A32)"
          textColor="var(--color-neutral, #F9F3E5)"
          glare={0}
          depth={0.5}
          tileRadius={8}
          gap="clamp(2px, 0.6vw, 6px)"
          fontSize="clamp(18px, 6vw, 52px)"
          loop
          padTo={14}
          intro
          aria-hidden="true"
        />
      </div>
      <p className={styles.message}>Your next project starts here.</p>
      <div className={styles.divider} aria-hidden="true" />
      <p className={styles.status}>Opening your dashboard…</p>    </section>
  </main>;
}
