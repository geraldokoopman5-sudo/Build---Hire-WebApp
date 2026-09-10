import {
  useState,
  type ChangeEvent,
} from 'react';

import styles from './CompanySettingsModal.module.css';

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

interface FormErrors {
  companyName?: string;
  companyEmail?: string;
  phone?: string;
}

export default function CompanySettingsModal({
  initialValues,
  onClose,
  onSave,
  onDeleteAccount,
}: CompanySettingsModalProps) {
  const [values, setValues] =
    useState<CompanySettingsValues>(
      initialValues
    );

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [isConfirmingDelete, setIsConfirmingDelete] =
    useState<boolean>(false);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    const {
      name,
      value,
    } = event.target;

    setValues((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: undefined,
    }));
  };

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};

    const companyName =
      values.companyName.trim();

    const companyEmail =
      values.companyEmail.trim();

    const phone =
      values.phone.trim();

    if (!companyName) {
      nextErrors.companyName =
        'Company name is required.';
    } else if (companyName.length < 2) {
      nextErrors.companyName =
        'Company name must be at least 2 characters.';
    }

    if (!companyEmail) {
      nextErrors.companyEmail =
        'Company email is required.';
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        companyEmail
      )
    ) {
      nextErrors.companyEmail =
        'Enter a valid email address.';
    }

    if (!phone) {
      nextErrors.phone =
        'Phone number is required.';
    } else if (
      !/^[+]?[0-9\s().-]{7,20}$/.test(
        phone
      )
    ) {
      nextErrors.phone =
        'Enter a valid phone number.';
    }

    return nextErrors;
  };

  const handleSave = (): void => {
    const validationErrors =
      validate();

    setErrors(validationErrors);

    if (
      Object.keys(validationErrors).length > 0
    ) {
      return;
    }

    onSave({
      companyName:
        values.companyName.trim(),

      companyEmail:
        values.companyEmail.trim(),

      phone:
        values.phone.trim(),
    });

    onClose();
  };

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div className={styles.modal}>
        <div className={styles.headerRow}>
          <h2
            id="settings-title"
            className={styles.title}
          >
            Account Settings
          </h2>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        <div className={styles.field}>
          <label
            htmlFor="settingsCompanyName"
            className={styles.label}
          >
            Company Name
          </label>

          <input
            id="settingsCompanyName"
            name="companyName"
            type="text"
            value={values.companyName}
            onChange={handleChange}
            className={`${styles.input} ${
              errors.companyName
                ? styles.inputError
                : ''
            }`}
            aria-invalid={
              Boolean(errors.companyName)
            }
            disabled={false}
          />

          {errors.companyName && (
            <span className={styles.errorText}>
              {errors.companyName}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <label
            htmlFor="settingsCompanyEmail"
            className={styles.label}
          >
            Company Email
          </label>

          <input
            id="settingsCompanyEmail"
            name="companyEmail"
            type="email"
            value={values.companyEmail}
            onChange={handleChange}
            className={`${styles.input} ${
              errors.companyEmail
                ? styles.inputError
                : ''
            }`}
            aria-invalid={
              Boolean(errors.companyEmail)
            }
          />

          {errors.companyEmail && (
            <span className={styles.errorText}>
              {errors.companyEmail}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <label
            htmlFor="settingsPhone"
            className={styles.label}
          >
            Phone
          </label>

          <input
            id="settingsPhone"
            name="phone"
            type="tel"
            value={values.phone}
            onChange={handleChange}
            className={`${styles.input} ${
              errors.phone
                ? styles.inputError
                : ''
            }`}
            aria-invalid={
              Boolean(errors.phone)
            }
          />

          {errors.phone && (
            <span className={styles.errorText}>
              {errors.phone}
            </span>
          )}
        </div>

        <button
          type="button"
          className={styles.saveButton}
          onClick={handleSave}
        >
          Save Changes
        </button>

        <div className={styles.dangerZone}>
          <h3 className={styles.dangerTitle}>
            Danger Zone
          </h3>

          <p className={styles.dangerText}>
            Deleting your account removes your
            company profile, jobs, and workforce
            records. This action cannot be undone.
          </p>

          {!isConfirmingDelete ? (
            <button
              type="button"
              className={styles.deleteButton}
              onClick={() =>
                setIsConfirmingDelete(true)
              }
            >
              Delete Account
            </button>
          ) : (
            <div className={styles.confirmRow}>
              <button
                type="button"
                className={
                  styles.confirmDeleteButton
                }
                onClick={onDeleteAccount}
              >
                Yes, delete my account
              </button>

              <button
                type="button"
                className={styles.cancelButton}
                onClick={() =>
                  setIsConfirmingDelete(false)
                }
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}