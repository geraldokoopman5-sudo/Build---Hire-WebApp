import { Link } from 'react-router-dom';
import styles from './WorkforceHeader.module.css';

type WorkforceNavLink = 'find-talent';

interface WorkforceHeaderProps {
  activeLink?: WorkforceNavLink;
}

export default function WorkforceHeader({
  activeLink,
}: WorkforceHeaderProps) {
  return (
    <header className={styles.header}>
      <Link to="/marketplace" className={styles.logo}>
        Build &amp; Hire
      </Link>

      <nav className={styles.nav} aria-label="Workforce navigation">
        <Link
          to="/marketplace"
          className={`${styles.navLink} ${
            activeLink === 'find-talent'
              ? styles.navLinkActive
              : ''
          }`}
        >
          Find Talent
        </Link>
      </nav>
    </header>
  );
}