import { useState, type ChangeEvent } from 'react';
import styles from '../CompanySettingsModal/ComapanySettingsModal.module.css';

export interface CompanySettingsValues {
  companyName: string;
  companyEmail: string;
  phone: string;
}

interface CompanySettingsModalProps {
  initialValues: CompanySettingsValues;
  onClose: () => void;
  onSave: (values: CompanySettingsValues) => void;
  onDeleteAccount: () => void;
}

export default function CompanySettingsModal({
  initialValues,
  onClose,
  onSave,
  onDeleteAccount,
}: CompanySettingsModalProps) {
  const [values, setValues] = useState<CompanySettingsValues>(initialValues);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState<boolean>(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (): Promise<void> => {
    setIsSaving(true);
    // TODO: replace with a real PUT /api/companies/:id call once auth is wired up.
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSaving(false);
    onSave(values);
    onClose();
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.headerRow}>
          <h2 className={styles.title}>Account Settings</h2>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className={styles.field}>
          <label htmlFor="settingsCompanyName" className={styles.label}>
            Company Name
          </label>
          <input
            id="settingsCompanyName"
            name="companyName"
            type="text"
            value={values.companyName}
            onChange={handleChange}
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="settingsCompanyEmail" className={styles.label}>
            Company Email
          </label>
          <input
            id="settingsCompanyEmail"
            name="companyEmail"
            type="email"
            value={values.companyEmail}
            onChange={handleChange}
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="settingsPhone" className={styles.label}>
            Phone
          </label>
          <input
            id="settingsPhone"
            name="phone"
            type="tel"
            value={values.phone}
            onChange={handleChange}
            className={styles.input}
          />
        </div>

        <button type="button" className={styles.saveButton} onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving…' : 'Save Changes'}
        </button>

        <div className={styles.dangerZone}>
          <h3 className={styles.dangerTitle}>Danger Zone</h3>
          <p className={styles.dangerText}>
            Deleting your account removes your company profile, jobs, and workforce records. This
            can&apos;t be undone.
          </p>

          {isConfirmingDelete ? (
            <div className={styles.confirmRow}>
              <button type="button" className={styles.confirmDeleteButton} onClick={onDeleteAccount}>
                Yes, delete my account
              </button>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => setIsConfirmingDelete(false)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              className={styles.deleteButton}
              onClick={() => setIsConfirmingDelete(true)}
            >
              Delete Account
            </button>
          )}
        </div>
      </div>
    </div>
  );
}