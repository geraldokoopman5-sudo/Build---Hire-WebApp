import { Link } from 'react-router-dom';
import styles from './AppHeader.module.css';

export default function AppHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button type="button" className={styles.menuButton} aria-label="Menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
        <Link to="/marketplace" className={styles.logo}>
          Build &amp; Hire
        </Link>
      </div>

      <div className={styles.right}>
        <button type="button" className={styles.iconButton} aria-label="Notifications">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
        </button>
        <div className={styles.avatar}>JS</div>
      </div>
    </header>
  );
}