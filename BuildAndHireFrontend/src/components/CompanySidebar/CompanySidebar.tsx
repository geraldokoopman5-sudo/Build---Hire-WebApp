import {
  useEffect,
  useState,
} from 'react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

import CompanySettingsModal, {
  type CompanySettingsValues,
} from '../CompanySettingsModal/CompanySettingsModal';

import {
  logout,
} from '../../utils/auth';

import styles from './CompanySidebar.module.css';

type CompanyNavLink =
  | 'my-jobs'
  | 'workforce'
  | 'applications';

interface CompanySidebarProps {
  activeLink?: CompanyNavLink;
}

const COMPANY_SETTINGS_KEY =
  'buildandhire.companySettings';

const DEFAULT_SETTINGS: CompanySettingsValues = {
  companyName: '',
  companyEmail: '',
  phone: '',
};

function loadSettings():
  CompanySettingsValues {
  try {
    const stored =
      localStorage.getItem(
        COMPANY_SETTINGS_KEY
      );

    if (!stored) {
      return DEFAULT_SETTINGS;
    }

    const parsed: unknown =
      JSON.parse(stored);

    if (
      typeof parsed !== 'object' ||
      parsed === null
    ) {
      return DEFAULT_SETTINGS;
    }

    const settings =
      parsed as Partial<CompanySettingsValues>;

    return {
      companyName:
        settings.companyName ?? '',
      companyEmail:
        settings.companyEmail ?? '',
      phone:
        settings.phone ?? '',
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export default function CompanySidebar({
  activeLink,
}: CompanySidebarProps) {
  const navigate = useNavigate();

  const [
    isSettingsOpen,
    setIsSettingsOpen,
  ] = useState<boolean>(false);

  const [
    settings,
    setSettings,
  ] =
    useState<CompanySettingsValues>(
      loadSettings
    );

  useEffect(() => {
    localStorage.setItem(
      COMPANY_SETTINGS_KEY,
      JSON.stringify(settings)
    );
  }, [settings]);

  const handleSaveSettings = (
    values: CompanySettingsValues
  ): void => {
    setSettings(values);
    setIsSettingsOpen(false);
  };

  const handleDeleteAccount =
    (): void => {
      localStorage.removeItem(
        COMPANY_SETTINGS_KEY
      );

      logout();

      setIsSettingsOpen(false);

      navigate('/');
    };

  return (
    <aside
      className={styles.sidebar}
    >
      <div>
        <div
          className={
            styles.brandBlock
          }
        >
          <span
            className={
              styles.brandEyebrow
            }
          >
            Marketplace
          </span>

          <span
            className={
              styles.brandName
            }
          >
            Build &amp; Hire
          </span>
        </div>

        <nav
          className={styles.nav}
        >
          <Link
            to="/company/jobs"
            className={`${
              styles.navItem
            } ${
              activeLink ===
              'my-jobs'
                ? styles.navItemActive
                : ''
            }`}
          >
            <span
              className={styles.icon}
              aria-hidden="true"
            />

            My Jobs
          </Link>

          <Link
            to="/company/workforce"
            className={`${
              styles.navItem
            } ${
              activeLink ===
              'workforce'
                ? styles.navItemActive
                : ''
            }`}
          >
            <span
              className={styles.icon}
              aria-hidden="true"
            />

            Workforce
          </Link>

          <Link
            to="/company/applications"
            className={`${
              styles.navItem
            } ${
              activeLink ===
              'applications'
                ? styles.navItemActive
                : ''
            }`}
          >
            <span
              className={styles.icon}
              aria-hidden="true"
            />

            Applications
          </Link>
        </nav>

        <button
          type="button"
          className={
            styles.settingsItem
          }
          onClick={() =>
            setIsSettingsOpen(true)
          }
        >
          <span
            className={styles.icon}
            aria-hidden="true"
          />

          Settings
        </button>
      </div>

      {isSettingsOpen && (
        <CompanySettingsModal
          initialValues={settings}
          onClose={() =>
            setIsSettingsOpen(false)
          }
          onSave={
            handleSaveSettings
          }
          onDeleteAccount={
            handleDeleteAccount
          }
        />
      )}
    </aside>
  );
}