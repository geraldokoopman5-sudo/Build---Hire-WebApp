import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import JobsHeader from '../../components/JobsHeader/JobsHeader';
import { getCurrentCustomerId, useCustomerJobs } from '../../context/CustomerJobsContext';
import { PaymentEnum } from '../../types/enums';
import { formatCurrency } from '../../utils/quoteMath';
import styles from './QuoteReview.module.css';

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-ZA', {
    timeZone: 'UTC', day: '2-digit', month: 'long', year: 'numeric',
  }).format(date);
}

export default function QuoteReview() {
  const { id } = useParams<{ id: string }>();
  const { getJobById, requestEftPayment, loading, error } = useCustomerJobs();
  const [reference, setReference] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const job = id ? getJobById(id) : undefined;

  if (loading || error) return <><JobsHeader activeLink="my-jobs" /><p role={error ? 'alert' : 'status'}>{error || 'Loading quote…'}</p></>;
  if (!job || job.customerId !== getCurrentCustomerId()) return (
    <div className={styles.page}><JobsHeader activeLink="my-jobs" /><main className={styles.notFound}>
      <p>Quote not found for this account.</p><Link to="/my-jobs" className={styles.backLink}>Back to My Jobs</Link>
    </main></div>
  );

  const requestPayment = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      await requestEftPayment(job.jobId, reference);
    } catch (reason) {
      setSubmitError(reason instanceof Error ? reason.message : 'Could not request EFT payment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <JobsHeader activeLink="my-jobs" />
      <main className={styles.main}>
        <Link to={`/my-jobs/${job.jobId}`} className={styles.backLink}>← Back to Job</Link>
        <div className={styles.headerRow}>
          <div><span className={styles.eyebrow}>Quote Review</span><h1 className={styles.title}>Project quote</h1>
            <p className={styles.companyLine}>{job.companyName}</p></div>
          <div className={styles.referenceBlock}><span className={styles.referenceLabel}>Job Reference</span>
            <span className={styles.referenceValue}>{job.jobId}</span></div>
        </div>
        <div className={styles.contentGrid}>
          <section className={styles.descriptionCard}>
            <h2 className={styles.cardTitle}>Job Description</h2><p className={styles.description}>{job.jobDescription}</p>
            <div className={styles.dateRow}>
              <div className={styles.dateBox}><span className={styles.dateLabel}>Start</span><span className={styles.dateValue}>{formatDate(job.startDate)}</span></div>
              <div className={styles.dateBox}><span className={styles.dateLabel}>End</span><span className={styles.dateValue}>{formatDate(job.endDate)}</span></div>
            </div>
          </section>
          <aside className={styles.summaryCard}>
            <h2 className={styles.cardTitle}>Quote Summary</h2>
            <div className={styles.totalRow}><span>Total quoted</span><span className={styles.totalValue}>{job.quote > 0 ? formatCurrency(job.quote) : 'Awaiting quote'}</span></div>
            {job.paymentStatus === PaymentEnum.Pending && <p role="status">EFT request pending. An admin must verify the transfer before it is marked paid.</p>}
            {job.paymentStatus === PaymentEnum.Successful && <p role="status">Payment verified and marked successful.</p>}
            {job.paymentStatus === PaymentEnum.Failed && <p role="status">Payment was not verified. Contact support about this job.</p>}
            {job.paymentReference && <p>Bank reference: {job.paymentReference}</p>}
            {job.quote > 0 && job.paymentStatus == null && <>
              <p className={styles.termsText}>This records an EFT request. It does not transfer money or confirm payment. Obtain verified bank details separately and keep your bank receipt.</p>
              <label className={styles.paymentLabel} htmlFor="eft-reference">Your bank transfer reference (optional)</label>
              <input id="eft-reference" className={styles.paymentOption} value={reference} maxLength={100} onChange={event => setReference(event.target.value)} />
              {submitError && <p role="alert">{submitError}</p>}
              <button type="button" className={styles.acceptButton} disabled={submitting} onClick={requestPayment}>
                {submitting ? 'Submitting…' : 'Submit EFT request'}
              </button>
            </>}
          </aside>
        </div>
      </main>
    </div>
  );
}
