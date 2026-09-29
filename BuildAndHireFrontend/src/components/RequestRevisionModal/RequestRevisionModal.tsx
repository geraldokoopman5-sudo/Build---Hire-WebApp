import {
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';

import styles from './RequestRevisionModal.module.css';

interface RequestRevisionModalProps {
  quoteId: string;
  onClose: () => void;
  onSubmit: (
    quoteId: string,
    reason: string,
    requestedChanges: string
  ) => void;
}

export default function RequestRevisionModal({
  quoteId,
  onClose,
  onSubmit,
}: RequestRevisionModalProps) {
  const [reason, setReason] =
    useState<string>('');

  const [requestedChanges, setRequestedChanges] =
    useState<string>('');

  const [error, setError] =
    useState<string>('');

  const handleReasonChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setReason(event.target.value);
    setError('');
  };

  const handleChangesChange = (
    event: ChangeEvent<HTMLTextAreaElement>
  ): void => {
    setRequestedChanges(event.target.value);
    setError('');
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ): void => {
    event.preventDefault();

    const cleanReason =
      reason.trim();

    const cleanChanges =
      requestedChanges.trim();

    if (!cleanReason) {
      setError(
        'Please provide a reason for the revision.'
      );
      return;
    }

    if (cleanReason.length < 5) {
      setError(
        'The reason must be at least 5 characters.'
      );
      return;
    }

    if (!cleanChanges) {
      setError(
        'Please describe the changes you are requesting.'
      );
      return;
    }

    if (cleanChanges.length < 10) {
      setError(
        'Please provide more detail about the requested changes.'
      );
      return;
    }

    onSubmit(
      quoteId,
      cleanReason,
      cleanChanges
    );
  };

  return (
    <div
      className={styles.overlay}
      role="presentation"
    >
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="revision-title"
      >
        <div className={styles.header}>
          <div>
            <span className={styles.eyebrow}>
              Quote Review
            </span>

            <h2
              id="revision-title"
              className={styles.title}
            >
              Request Revision
            </h2>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {error && (
          <p
            className={styles.error}
            role="alert"
          >
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <label className={styles.label}>
            Reason

            <input
              type="text"
              value={reason}
              onChange={handleReasonChange}
              className={styles.input}
              placeholder="Example: Quote is above the expected budget"
              maxLength={500}
            />
          </label>

          <label className={styles.label}>
            Requested Changes

            <textarea
              value={requestedChanges}
              onChange={handleChangesChange}
              className={styles.textarea}
              placeholder="Explain what you'd like changed in the quote..."
              rows={6}
              maxLength={3000}
            />
          </label>

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className={styles.submitButton}
            >
              Submit Revision Request
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}