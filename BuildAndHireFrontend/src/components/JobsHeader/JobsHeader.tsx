import { Link } from 'react-router-dom';
import styles from './JobsHeader.module.css';

type JobsNavLink = 'home' | 'browse-companies';

interface JobsHeaderProps {
  activeLink?: JobsNavLink;
  avatarUrl?: string;
}

export default function JobsHeader({ activeLink, avatarUrl }: JobsHeaderProps) {
  return (
    <header className={styles.header}>
      <Link to="/marketplace" className={styles.logo}>
        Build &amp; Hire
      </Link>

      <nav className={styles.nav}>
        <Link
          to="/home"
          className={`${styles.navLink} ${
            activeLink === 'home' ? styles.navLinkActive : ''
          }`}
        >
          Home
        </Link>

        <Link
          to="/marketplace"
          className={`${styles.navLink} ${
            activeLink === 'browse-companies' ? styles.navLinkActive : ''
          }`}
        >
          Browse Companies
        </Link>
      </nav>

      <div className={styles.avatar}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Account"
            className={styles.avatarImage}
          />
        ) : (
          'JS'
        )}
      </div>
    </header>
  );
}