import { Link } from 'react-router-dom';
import styles from './WorkforceHeader.module.css';

type WorkforceNavLink = 'find-talent' | 'my-projects' | 'messages';

interface WorkforceHeaderProps {
  activeLink?: WorkforceNavLink;
}

export default function WorkforceHeader({ activeLink }: WorkforceHeaderProps) {
  return (
    <header className={styles.header}>
      <Link to="/marketplace" className={styles.logo}>
        Build &amp; Hire
      </Link>

      <nav className={styles.nav}>
        <Link
          to="/marketplace"
          className={`${styles.navLink} ${activeLink === 'find-talent' ? styles.navLinkActive : ''}`}
        >
         
          
        </Link>
        <Link
          to="/messages"
          className={`${styles.navLink} ${activeLink === 'messages' ? styles.navLinkActive : ''}`}
        >
        </Link>
      </nav>
{/* 
      <button type="button" className={styles.menuButton} aria-label="Menu">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button> */}
    </header>
  );
}