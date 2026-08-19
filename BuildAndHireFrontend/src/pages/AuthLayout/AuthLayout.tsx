import type { ReactNode } from 'react';
import styles from './AuthLayout.module.css';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.logo}>Build &amp; Hire</h1>
        <button type="button" className={styles.cartButton} aria-label="Cart">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 6h15l-1.5 9h-12z" />
            <path d="M6 6L4 3H2" />
            <circle cx="9" cy="20" r="1" />
            <circle cx="18" cy="20" r="1" />
          </svg>
        </button>
      </header>

      <main className={styles.main}>
        <div className={`${styles.decorPanel} ${styles['decorPanel--left']}`} aria-hidden="true" />
        <div className={`${styles.decorPanel} ${styles['decorPanel--right']}`} aria-hidden="true" />
        {children}
      </main>

      <footer className={styles.siteFooter}>
        <span>👑 Made by Crown 2026 👑</span>
        <nav className={styles.footerNav}>
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
          <a href="/shipping">Shipping Info</a>
          <a href="/contact">Contact Us</a>
        </nav>
      </footer>
    </div>
  );
}