import { Link } from 'react-router-dom';
import styles from './DashboardHeader.module.css';

interface DashboardHeaderProps {
  activeLink?: 'projects' | 'marketplace' | 'hires' | 'profile';
}

export default function DashboardHeader({ activeLink }: DashboardHeaderProps) {
  return (
    <header className={styles.header}>
      <Link to="/marketplace" className={styles.logo}>
        Build &amp; Hire
      </Link>

      <nav className={styles.nav}>
        <Link
          to="/projects"
          className={`${styles.navLink} ${activeLink === 'projects' ? styles.navLinkActive : ''}`}
        >
          Projects
        </Link>
        <Link
          to="/marketplace"
          className={`${styles.navLink} ${activeLink === 'marketplace' ? styles.navLinkActive : ''}`}
        >
          Marketplace
        </Link>
        <Link
          to="/hires"
          className={`${styles.navLink} ${activeLink === 'hires' ? styles.navLinkActive : ''}`}
        >
          Hires
        </Link>
        <Link
          to="/profile"
          className={`${styles.navLink} ${activeLink === 'profile' ? styles.navLinkActive : ''}`}
        >
          Profile
        </Link>
      </nav>

      <button type="button" className={styles.menuButton} aria-label="Menu">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>
    </header>
  );
}