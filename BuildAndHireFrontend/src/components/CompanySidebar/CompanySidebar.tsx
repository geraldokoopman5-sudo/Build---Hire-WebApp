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
import { apiRequest } from '../../utils/api';
import type { Address } from '../../types/company';

import styles from './CompanySidebar.module.css';

type CompanyNavLink =
  | 'my-jobs'
  | 'workforce'
  | 'applications';

interface CompanySidebarProps {
  activeLink?: CompanyNavLink;
}

const DEFAULT_SETTINGS: CompanySettingsValues = {
  companyName: '',
  companyEmail: '',
};
interface ApiCompany extends CompanySettingsValues {
  address: Address;
  registrationNumber: string;
  taxNumber: string;
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
      DEFAULT_SETTINGS
    );
  const [company, setCompany] = useState<ApiCompany | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const id = localStorage.getItem('buildandhire.companyId');
    if (!id) return;
    const controller = new AbortController();
    apiRequest<ApiCompany>(`/api/Companies/${id}`, { signal: controller.signal })
      .then(data => {
        if (!controller.signal.aborted) {
          setCompany(data);
          setSettings({ companyName: data.companyName, companyEmail: data.companyEmail });
        }
      })
      .catch((reason: unknown) => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : 'Could not load company settings.'); });
    return () => controller.abort();
  }, []);

  const handleSaveSettings = async (
    values: CompanySettingsValues
  ): Promise<void> => {
    const id = localStorage.getItem('buildandhire.companyId');
    if (!id || !company) throw new Error('Company details are not available.');
    await apiRequest(`/api/Companies/${id}`, { method: 'PUT', body: JSON.stringify({
      ...values, address: company.address,
      registrationNumber: company.registrationNumber, taxNumber: company.taxNumber,
    }) });
    setCompany({ ...company, ...values });
    setSettings(values);
    setIsSettingsOpen(false);
    setError('');
  };

  const handleDeleteAccount =
    async (): Promise<void> => {
      const id = localStorage.getItem('buildandhire.companyId');
      if (!id) throw new Error('Company account is not available.');
      await apiRequest(`/api/Companies/${id}`, { method: 'DELETE' });

      logout();

      setIsSettingsOpen(false);

      navigate('/');
    };

  return (
    <aside
      className={styles.sidebar}
    >
      {error && <p role="alert">{error}</p>}
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

            Job Requests
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
