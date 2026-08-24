import { Link } from 'react-router-dom';
import styles from './JobsHeader.module.css';

type JobsNavLink = 'home' | 'my-jobs' | 'browse-companies' | 'messages';

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
          className={`${styles.navLink} ${activeLink === 'home' ? styles.navLinkActive : ''}`}
        >
          Home
        </Link>
        <Link
          to="/my-jobs"
          className={`${styles.navLink} ${activeLink === 'my-jobs' ? styles.navLinkActive : ''}`}
        >
          My Jobs
        </Link>
        <Link
          to="/marketplace"
          className={`${styles.navLink} ${activeLink === 'browse-companies' ? styles.navLinkActive : ''}`}
        >
          Browse Companies
        </Link>
        <Link
          to="/messages"
          className={`${styles.navLink} ${activeLink === 'messages' ? styles.navLinkActive : ''}`}
        >
          Messages
        </Link>
      </nav>

      <div className={styles.avatar}>
        {avatarUrl ? <img src={avatarUrl} alt="Account" className={styles.avatarImage} /> : 'JS'}
      </div>
    </header>
  );
}