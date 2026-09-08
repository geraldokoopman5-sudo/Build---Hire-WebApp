import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import CompanyLayout from '../../components/CompanyLayout/CompanyLayout';
import { companyJobs } from '../../data/companyJobs';
import {
  getJobStatusLabel,
  getPaymentStateLabel,
} from '../../utils/jobLabels';
import type { JobStatus } from '../../types/job';

import styles from './CompanyJobManagement.module.css';

export default function CompanyJobManagement() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  const job = companyJobs.find((entry) => entry.id === jobId);

  const [status, setStatus] = useState<JobStatus>(
    job?.status ?? 'working'
  );

  const [isChangingStatus, setIsChangingStatus] =
    useState<boolean>(false);

  const [isClosingJob, setIsClosingJob] =
    useState<boolean>(false);

  if (!job) {
    return (
      <CompanyLayout activeSidebarLink="my-jobs">
        <div className={styles.notFound}>
          <span className={styles.eyebrow}>Job Management</span>

          <h1 className={styles.notFoundTitle}>
            Job Not Found
          </h1>

          <p className={styles.notFoundText}>
            The job you are trying to manage could not be found.
          </p>

          <Link
            to="/company/jobs"
            className={styles.backButton}
          >
            Back to My Jobs
          </Link>
        </div>
      </CompanyLayout>
    );
  }

  const handleStatusChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    setStatus(event.target.value as JobStatus);
  };

  const handleSaveStatus = (): void => {
    /*
     * TODO:
     * Replace this local state update with the backend request
     * once Jobs API integration is implemented.
     */
    console.log('Updating job status:', {
      jobId: job.id,
      status,
    });

    setIsChangingStatus(false);
  };

  const handleCloseJob = (): void => {
    /*
     * TODO:
     * Replace this with the backend close-job request.
     */
    console.log('Closing job:', job.id);

    setStatus('unavailable');
    setIsClosingJob(false);
  };

  return (
    <CompanyLayout activeSidebarLink="my-jobs">
      <div className={styles.pageHeader}>
        <div>
          <Link
            to="/company/jobs"
            className={styles.backLink}
          >
            ← Back to My Jobs
          </Link>

          <span className={styles.eyebrow}>
            Job Management
          </span>

          <h1 className={styles.title}>
            {job.title}
          </h1>

          <p className={styles.subtitle}>
            Review the job details and manage the current
            project.
          </p>
        </div>

        <span
          className={`${styles.statusBadge} ${
            styles[`status-${status}`]
          }`}
        >
          {getJobStatusLabel(status)}
        </span>
      </div>

      <div className={styles.layout}>
        <main className={styles.mainColumn}>
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <span className={styles.sectionEyebrow}>
                  Overview
                </span>

                <h2 className={styles.cardTitle}>
                  Job Details
                </h2>
              </div>
            </div>

            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>
                  Job ID
                </span>

                <span className={styles.detailValue}>
                  {job.id}
                </span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>
                  Quote
                </span>

                <span className={styles.detailValue}>
                  ${job.quoteAmount.toLocaleString()}
                </span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>
                  Schedule
                </span>

                <span className={styles.detailValue}>
                  {job.dateRange}
                </span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>
                  Payment Status
                </span>

                <span className={styles.detailValue}>
                  {getPaymentStateLabel(job.paymentState)}
                </span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>
                  Amount Paid
                </span>

                <span className={styles.detailValue}>
                  ${job.amountPaid.toLocaleString()}
                </span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>
                  Payment Note
                </span>

                <span className={styles.detailValue}>
                  {job.paymentNote}
                </span>
              </div>
            </div>

            <div className={styles.descriptionSection}>
              <span className={styles.detailLabel}>
                Job Description
              </span>

              <p className={styles.description}>
                {job.description}
              </p>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <span className={styles.sectionEyebrow}>
                  Project
                </span>

                <h2 className={styles.cardTitle}>
                  Job Actions
                </h2>
              </div>
            </div>

            <div className={styles.actionGrid}>
              <button
                type="button"
                className={styles.actionButton}
                onClick={() => setIsChangingStatus(true)}
              >
                <span className={styles.actionTitle}>
                  Change Status
                </span>

                <span className={styles.actionDescription}>
                  Update the current job status.
                </span>
              </button>

              <button
                type="button"
                className={styles.actionButton}
                onClick={() =>
                  navigate('/company/workforce')
                }
              >
                <span className={styles.actionTitle}>
                  Manage Workers
                </span>

                <span className={styles.actionDescription}>
                  Open the workforce management area.
                </span>
              </button>

              <button
                type="button"
                className={styles.actionButton}
                onClick={() => {
                  console.log(
                    'View applications for job:',
                    job.id
                  );
                }}
              >
                <span className={styles.actionTitle}>
                  View Applications
                </span>

                <span className={styles.actionDescription}>
                  Review people who applied to this job.
                </span>
              </button>

              <button
                type="button"
                className={styles.actionButton}
                onClick={() => {
                  console.log(
                    'View payment for job:',
                    job.id
                  );
                }}
              >
                <span className={styles.actionTitle}>
                  View Payment
                </span>

                <span className={styles.actionDescription}>
                  Review payment information for this job.
                </span>
              </button>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <span className={styles.sectionEyebrow}>
                  Workers
                </span>

                <h2 className={styles.cardTitle}>
                  Workforce Assignment
                </h2>
              </div>
            </div>

            <div className={styles.emptyState}>
              <h3 className={styles.emptyStateTitle}>
                Worker assignments will appear here
              </h3>

              <p className={styles.emptyStateText}>
                Once the backend is connected, this section
                will show the workers assigned to this job.
              </p>

              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() =>
                  navigate('/company/workforce')
                }
              >
                Manage Workforce
              </button>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <span className={styles.sectionEyebrow}>
                  Applications
                </span>

                <h2 className={styles.cardTitle}>
                  Job Applications
                </h2>
              </div>
            </div>

            <div className={styles.emptyState}>
              <h3 className={styles.emptyStateTitle}>
                Applications will appear here
              </h3>

              <p className={styles.emptyStateText}>
                This area will display customer or worker
                applications connected to this job once the
                API is integrated.
              </p>

              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() =>
                  console.log(
                    'Applications requested for:',
                    job.id
                  )
                }
              >
                View Applications
              </button>
            </div>
          </section>
        </main>

        <aside className={styles.sideColumn}>
          <section className={styles.summaryCard}>
            <span className={styles.sectionEyebrow}>
              Financial Summary
            </span>

            <h2 className={styles.cardTitle}>
              Payment
            </h2>

            <div className={styles.summaryRow}>
              <span>Quote</span>

              <strong>
                ${job.quoteAmount.toLocaleString()}
              </strong>
            </div>

            <div className={styles.summaryRow}>
              <span>Paid</span>

              <strong>
                ${job.amountPaid.toLocaleString()}
              </strong>
            </div>

            <div className={styles.summaryDivider} />

            <div className={styles.summaryRow}>
              <span>Payment Status</span>

              <span
                className={`${styles.paymentBadge} ${
                  styles[`payment-${job.paymentState}`]
                }`}
              >
                {getPaymentStateLabel(job.paymentState)}
              </span>
            </div>

            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() =>
                console.log(
                  'Payment details requested for:',
                  job.id
                )
              }
            >
              View Payment Details
            </button>
          </section>

          <section className={styles.dangerCard}>
            <span className={styles.sectionEyebrow}>
              Job Controls
            </span>

            <h2 className={styles.cardTitle}>
              Close Job
            </h2>

            <p className={styles.dangerText}>
              Closing this job will mark it as unavailable.
              You can replace this with your final backend
              status once the API is connected.
            </p>

            <button
              type="button"
              className={styles.dangerButton}
              onClick={() => setIsClosingJob(true)}
              disabled={status === 'unavailable'}
            >
              {status === 'unavailable'
                ? 'Job Closed'
                : 'Close Job'}
            </button>
          </section>
        </aside>
      </div>

      {isChangingStatus && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.sectionEyebrow}>
                  Job Status
                </span>

                <h2 className={styles.modalTitle}>
                  Change Job Status
                </h2>
              </div>

              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setIsChangingStatus(false)}
                aria-label="Close status dialog"
              >
                ×
              </button>
            </div>

            <label
              htmlFor="job-status"
              className={styles.detailLabel}
            >
              Status
            </label>

            <select
              id="job-status"
              value={status}
              onChange={handleStatusChange}
              className={styles.select}
            >
              <option value="working">
                Working
              </option>

              <option value="available">
                Available
              </option>

              <option value="unavailable">
                Unavailable
              </option>
            </select>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => setIsChangingStatus(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className={styles.confirmButton}
                onClick={handleSaveStatus}
              >
                Save Status
              </button>
            </div>
          </div>
        </div>
      )}

      {isClosingJob && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.sectionEyebrow}>
                  Confirmation
                </span>

                <h2 className={styles.modalTitle}>
                  Close this job?
                </h2>
              </div>

              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setIsClosingJob(false)}
                aria-label="Close confirmation dialog"
              >
                ×
              </button>
            </div>

            <p className={styles.modalText}>
              This will mark "{job.title}" as unavailable.
              The backend will handle the permanent status
              change once integration is complete.
            </p>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => setIsClosingJob(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className={styles.dangerButton}
                onClick={handleCloseJob}
              >
                Close Job
              </button>
            </div>
          </div>
        </div>
      )}
    </CompanyLayout>
  );
}