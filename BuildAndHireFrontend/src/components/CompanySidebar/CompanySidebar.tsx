import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CompanySettingsModal, {
  type CompanySettingsValues,
} from '../CompanySettingsModal/CompanySettingsModal';
import { logout } from '../../utils/auth';
import styles from './CompanySidebar.module.css';

type CompanyNavLink = 'home' | 'my-jobs' | 'workforce' | 'browse-companies';

interface CompanySidebarProps {
  activeLink?: CompanyNavLink;
}

// TODO: replace with the authenticated company's real details once auth is wired up.
const PLACEHOLDER_SETTINGS: CompanySettingsValues = {
  companyName: '',
  companyEmail: '',
  phone: '',
};

export default function CompanySidebar({ activeLink }: CompanySidebarProps) {
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const handleDeleteAccount = (): void => {
    // TODO: replace with a real DELETE /api/companies/:id call once auth is wired up.
    logout();
    setIsSettingsOpen(false);
    navigate('/');
  };

  return (
    <aside className={styles.sidebar}>
      <div>
        <div className={styles.brandBlock}>
          <span className={styles.brandEyebrow}>Marketplace</span>
          <span className={styles.brandName}>Build &amp; Hire</span>
        </div>

        <nav className={styles.nav}>
          <Link
            to="/company/jobs"
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
        </nav>

        <button
          type="button"
          className={styles.settingsItem}
          onClick={() => setIsSettingsOpen(true)}
        >
          <span className={styles.icon} aria-hidden="true"></span>
          Settings
        </button>
      </div>

      {isSettingsOpen && (
        <CompanySettingsModal
          initialValues={PLACEHOLDER_SETTINGS}
          onClose={() => setIsSettingsOpen(false)}
          onSave={(values) => {
            // TODO: replace with a real PUT /api/companies/:id call once auth is wired up.
            console.log('Updated company settings:', values);
          }}
          onDeleteAccount={handleDeleteAccount}
        />
      )}
    </aside>
  );
}