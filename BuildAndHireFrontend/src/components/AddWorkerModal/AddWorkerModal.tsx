import {
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';

import {
  WorkerStatus,
} from '../../types/worker';

import styles from './AddWorkerModal.module.css';

interface JobOption {
  id: string;
  title: string;
}

export interface AddWorkerInput {
  workerFirstName: string;
  workerLastName: string;
  workerStatus: WorkerStatus;
  companyId: string;
  jobId: string;
}

interface AddWorkerModalProps {
  companyId: string;
  jobs: JobOption[];
  onClose: () => void;
  onCreate: (input: AddWorkerInput) => void;
}

interface FormValues {
  firstName: string;
  lastName: string;
  status: WorkerStatus;
  jobId: string;
}

export default function AddWorkerModal({
  companyId,
  jobs,
  onClose,
  onCreate,
}: AddWorkerModalProps) {
  const [values, setValues] = useState<FormValues>({
    firstName: '',
    lastName: '',
    status: WorkerStatus.Pending,
    jobId: '',
  });

  const [error, setError] = useState<string>('');

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ): void => {
    const {
      name,
      value,
    } = event.target;

    setValues((current) => ({
      ...current,
      [name]:
        name === 'status'
          ? Number(value) as WorkerStatus
          : value,
    }));

    setError('');
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ): void => {
    event.preventDefault();

    const firstName =
      values.firstName.trim();

    const lastName =
      values.lastName.trim();

    if (!firstName) {
      setError('First name is required.');
      return;
    }

    if (!lastName) {
      setError('Last name is required.');
      return;
    }

    if (!values.jobId) {
      setError('Please select a job.');
      return;
    }

    onCreate({
      workerFirstName: firstName,
      workerLastName: lastName,
      workerStatus: values.status,
      companyId,
      jobId: values.jobId,
    });
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
        aria-labelledby="add-worker-title"
      >
        <div className={styles.header}>
          <div>
            <span className={styles.eyebrow}>
              Workforce
            </span>

            <h2
              id="add-worker-title"
              className={styles.title}
            >
              Add New Worker
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
          <div className={styles.field}>
            <label
              htmlFor="worker-first-name"
              className={styles.label}
            >
              First Name
            </label>

            <input
              id="worker-first-name"
              name="firstName"
              type="text"
              value={values.firstName}
              onChange={handleChange}
              className={styles.input}
              autoComplete="given-name"
            />
          </div>

          <div className={styles.field}>
            <label
              htmlFor="worker-last-name"
              className={styles.label}
            >
              Last Name
            </label>

            <input
              id="worker-last-name"
              name="lastName"
              type="text"
              value={values.lastName}
              onChange={handleChange}
              className={styles.input}
              autoComplete="family-name"
            />
          </div>

          <div className={styles.field}>
            <label
              htmlFor="worker-status"
              className={styles.label}
            >
              Status
            </label>

            <select
              id="worker-status"
              name="status"
              value={values.status}
              onChange={handleChange}
              className={styles.input}
            >
              <option value={WorkerStatus.Pending}>
                Pending
              </option>

              <option value={WorkerStatus.Active}>
                Active
              </option>

              <option value={WorkerStatus.Available}>
                Available
              </option>

              <option value={WorkerStatus.InActive}>
                Inactive
              </option>

              <option value={WorkerStatus.Unavailable}>
                Unavailable
              </option>
            </select>
          </div>

          <div className={styles.field}>
            <label
              htmlFor="worker-job"
              className={styles.label}
            >
              Assign to Job
            </label>

            <select
              id="worker-job"
              name="jobId"
              value={values.jobId}
              onChange={handleChange}
              className={styles.input}
            >
              <option value="">
                Select a job
              </option>

              {jobs.map((job) => (
                <option
                  key={job.id}
                  value={job.id}
                >
                  {job.title}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.actions}>
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
              disabled={jobs.length === 0}
            >
              Add Worker
            </button>
          </div>

          {jobs.length === 0 && (
            <p className={styles.helperText}>
              No jobs are available for assignment yet.
            </p>
          )}
        </form>
      </section>
    </div>
  );
}