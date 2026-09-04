import { Link } from 'react-router-dom';
import styles from './CompanySidebar.module.css';

type CompanyNavLink = 'home' | 'my-jobs' | 'workforce' | 'browse-companies' | 'messages';

interface CompanySidebarProps {
  activeLink?: CompanyNavLink;
}

export default function CompanySidebar({ activeLink }: CompanySidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <div>
        <div className={styles.brandBlock}>
          <span className={styles.brandEyebrow}>Marketplace</span>
          <span className={styles.brandName}>Build &amp; Hire</span>
        </div>

        <nav className={styles.nav}>
          <Link
            to="/company/home"
            className={`${styles.navItem} ${activeLink === 'home' ? styles.navItemActive : ''}`}
          >
            <span className={styles.icon} aria-hidden="true"></span>
            Home
          </Link>
          <Link
            to="/company/jobs"
            className={`${styles.navItem} ${activeLink === 'my-jobs' ? styles.navItemActive : ''}`}
          >
            <span className={styles.icon} aria-hidden="true"></span>
            My Jobs
          </Link>
          <Link
            to="/company/workforce"
            className={`${styles.navItem} ${activeLink === 'workforce' ? styles.navItemActive : ''}`}
          >
            <span className={styles.icon} aria-hidden="true"></span>
            Workforce
          </Link>
          <Link
            to="/marketplace"
            className={`${styles.navItem} ${activeLink === 'browse-companies' ? styles.navItemActive : ''}`}
          >
            <span className={styles.icon} aria-hidden="true"></span>
            Browse Companies
          </Link>
          <Link
            to="/messages"
            className={`${styles.navItem} ${activeLink === 'messages' ? styles.navItemActive : ''}`}
          >
            <span className={styles.icon} aria-hidden="true"></span>
            Messages
          </Link>
        </nav>

        <Link to="/company/settings" className={styles.settingsItem}>
          <span className={styles.icon} aria-hidden="true"></span>
          Settings
        </Link>
      </div>

      <button type="button" className={styles.postJobButton}>
        + Post a Job
      </button>
    </aside>
  );
}