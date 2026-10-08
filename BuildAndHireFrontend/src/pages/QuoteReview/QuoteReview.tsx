import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import CustomerPageLayout from '../../components/CustomerPageLayout/CustomerPageLayout';
import { getCurrentCustomerId, useCustomerJobs } from '../../context/CustomerJobsContext';
import type { CustomerJob } from '../../types/job';
import { PaymentEnum } from '../../types/enums';
import { needsQuoteReview, projectTitle } from '../../utils/customerDashboard';
import { canSimulatePayment, paymentLabel, paymentMessage, projectDate } from '../../utils/customerProject';
import { formatCurrency } from '../../utils/quoteMath';
import styles from '../../components/CustomerPageLayout/CustomerProject.module.css';

function QuoteContent({ job }: { job: CustomerJob }) {
  const { acceptQuote, requestEftPayment, refreshJobs } = useCustomerJobs();
  const [consent, setConsent] = useState(false);
  const [reference, setReference] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const ready = needsQuoteReview(job);
  const accepted = !!job.quoteAcceptedAt;
  const payable = canSimulatePayment(job);
  const closed = ['cancelled', 'rejected', 'unavailable'].includes(job.status);
  const hasPayment = job.paymentStatus != null;
  const phase = hasPayment && job.paymentStatus !== PaymentEnum.Pending ? 4 : accepted || hasPayment ? 3 : 1;

  async function submit(action: 'accept' | 'pay') {
    if (submitting || (action === 'accept' ? !ready || !consent : !payable)) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      if (action === 'accept') await acceptQuote(job.jobId, job.quote);
      else await requestEftPayment(job.jobId, reference);
    } catch (reason) {
      setSubmitError(reason instanceof Error ? reason.message : 'Could not save this request.');
      setConsent(false);
    } finally { setSubmitting(false); }
  }

  return <div className={styles.page}>
    <Link className={styles.back} to={`/my-jobs/${job.jobId}`}>← Back to project</Link>
    <div className={styles.quoteheading}><div><span className={styles.eyebrow}>Quote review</span><h1>A clear quote. Your next step.</h1><p>{projectTitle(job)} · {job.companyName || 'Company unavailable'}</p><span className={styles.reference} title={`Project reference: ${job.jobId}`}>Project · {job.jobId.slice(-6).toUpperCase()}</span></div><span className={styles.reviewbadge}>{hasPayment ? `Payment ${paymentLabel(job).toLowerCase()}` : closed ? 'Project closed' : accepted ? 'Quote accepted' : ready ? 'Awaiting your acceptance' : 'Awaiting company quote'}</span></div>
    <ol className={styles.steps} aria-label="Quote progress">{['Review quote', 'Accept quote', 'Simulate payment'].map((label, index) => <li key={label} className={`${styles.step} ${!closed && job.quoteSentAt ? index + 1 === phase ? styles.current : index + 1 < phase ? styles.done : '' : ''}`} aria-current={!closed && index + 1 === phase ? 'step' : undefined}><em>{index + 1}</em>{label}</li>)}</ol>
    <div className={styles.quotegrid}>
      <div className={styles.leftstack}>
        <section className={styles.panel}><span className={styles.smallheading}>The project</span><h2>Your project scope</h2><p className={styles.scope}>{job.jobDescription}</p><p className={styles.descriptionnote}>Project description provided in your request.</p><dl className={styles.schedule}><div><dt>Planned start</dt><dd>{projectDate(job.startDate)}</dd></div><div><dt>Planned end</dt><dd>{projectDate(job.endDate)}</dd></div><div><dt>Working days</dt><dd>{job.daysWorking} days</dd></div></dl><div className={styles.location}>{job.address ? [job.address.streetAddress, job.address.suburb, job.address.city, job.address.province, job.address.postalCode].filter(Boolean).join(', ') : 'Location unavailable'}</div></section>
        <section className={`${styles.panel} ${styles.companypanel}`}><div className={styles.monogram} aria-hidden="true">{(job.companyName || 'Company').split(' ').slice(0, 2).map(word => word[0]).join('')}</div><div><h2>{job.companyName || 'Company unavailable'}</h2><p>Your selected company</p></div><Link to={`/companies/${job.companyId}`}>View company ↗</Link></section>
        <section className={styles.nextsteps}><h2>What happens next?</h2><p><strong>Review and accept.</strong> Confirm the scope and the company’s quoted amount.<br /><strong>Try the payment flow.</strong> Submit a simulated payment request for administrator review.<br /><strong>Follow your project.</strong> Track the job’s status from your project dashboard.</p></section>
      </div>
      <aside className={styles.quoteaside}><h2>Your quote</h2><div className={styles.quotetotal}><span>Total quoted by the company</span><strong>{job.quote > 0 ? formatCurrency(job.quote) : 'Not quoted yet'}</strong><small>{job.quoteSentAt ? `Sent ${projectDate(job.quoteSentAt)}` : 'No company quote sent'}</small></div>
        {hasPayment ? <div className={`${styles.statebox} ${job.paymentStatus === PaymentEnum.Successful ? styles.green : job.paymentStatus === PaymentEnum.Failed ? styles.failed : ''}`} role="status"><strong>Payment {paymentLabel(job).toLowerCase()}</strong>{paymentMessage(job)}{job.paymentReference && <p className={styles.savedReference}>Demo reference: {job.paymentReference}</p>}</div>
          : closed ? <div className={styles.statebox}><strong>Project closed</strong>Quote acceptance and payment requests are unavailable for this project.</div>
          : payable ? <><div className={`${styles.statebox} ${styles.green}`} role="status"><strong>Quote accepted</strong>You agreed to this amount on {projectDate(job.quoteAcceptedAt)}. Your next step is the simulated payment request.</div><label className={styles.inputlabel} htmlFor="demo-reference">Demo reference (optional)</label><input className={styles.referenceinput} id="demo-reference" value={reference} onChange={event => setReference(event.target.value)} maxLength={100} disabled={submitting} placeholder="e.g. PROJECT-DEMO" /><button className={styles.fullbutton} type="button" disabled={submitting} onClick={() => void submit('pay')}>{submitting ? 'Saving request…' : 'Submit simulated payment →'}</button><p className={styles.actionnote}>Records a pending request for administrator review.</p></>
          : ready ? <><p className={styles.acceptcopy}>Review the project details and quoted amount. Accepting confirms this amount for your project.</p><label className={styles.consent}><input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} disabled={submitting} />I’ve reviewed the project scope and agree to the quoted amount.</label><button className={styles.fullbutton} type="button" disabled={!consent || submitting} onClick={() => void submit('accept')}>{submitting ? 'Accepting quote…' : 'Accept quote →'}</button><p className={styles.actionnote}>You’ll be able to simulate a payment after acceptance.</p></>
          : <div className={styles.statebox}><strong>{accepted ? 'Quote accepted' : 'Awaiting a quote'}</strong>{accepted ? 'Payment requests are unavailable in the current project state.' : 'The company must accept the job and send a quote before you can accept it.'}</div>}
        {submitError && <div className={`${styles.statebox} ${styles.failed}`} role="alert"><p>{submitError}</p><button className={styles.outlineaction} type="button" onClick={refreshJobs}>Refresh current quote</button></div>}
        <div className={styles.simbox}><strong>Demo payments only</strong>No money moves. Payment outcomes are set by an administrator in the demo.</div>
      </aside>
    </div>
    <footer className={styles.footnote}><span>Clear scope. Agreed amount. One step at a time.</span><span>Payments are simulated.</span></footer>
  </div>;
}

export default function QuoteReview() {
  const { id } = useParams<{ id: string }>();
  const { getJobById, loading, error, refreshJobs } = useCustomerJobs();
  const job = id ? getJobById(id) : undefined;
  return <CustomerPageLayout title="Quote review">
    {loading ? <section className={styles.state} role="status"><h2>Loading your quote</h2><p>Getting the current project and quoted amount.</p></section>
      : error ? <section className={styles.state} role="alert"><h2>We couldn’t load your quote</h2><p>{error}</p><button className={styles.fullbutton} onClick={refreshJobs}>Try again</button></section>
      : !job || job.customerId !== getCurrentCustomerId() ? <section className={styles.state}><h2>Quote not found</h2><p>This quote is unavailable for your account.</p><Link className={styles.outlineaction} to="/my-jobs">Back to my projects</Link></section>
      : <QuoteContent key={`${job.jobId}:${job.quote}:${job.quoteSentAt}`} job={job} />}
  </CustomerPageLayout>;
}
