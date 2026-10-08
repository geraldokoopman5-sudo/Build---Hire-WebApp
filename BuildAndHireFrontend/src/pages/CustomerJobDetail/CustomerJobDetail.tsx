import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import CustomerPageLayout from '../../components/CustomerPageLayout/CustomerPageLayout';
import { getCurrentCustomerId, useCustomerJobs } from '../../context/CustomerJobsContext';
import type { CustomerJob } from '../../types/job';
import { needsQuoteReview, projectTitle, projectQuoteNote } from '../../utils/customerDashboard';
import { canCancelProject, canSimulatePayment, paymentLabel, paymentMessage, projectDate } from '../../utils/customerProject';
import { formatCurrency } from '../../utils/quoteMath';
import styles from '../../components/CustomerPageLayout/CustomerProject.module.css';

function Details({ job }: { job: CustomerJob }) {
  const { cancelJob, refreshJobs } = useCustomerJobs();
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const closed = ['cancelled', 'rejected', 'unavailable'].includes(job.status);
  const progressing = ['in-progress', 'working', 'completed'].includes(job.status);
  const review = needsQuoteReview(job);
  const actionable = review || canSimulatePayment(job) || job.paymentStatus != null;
  const label = job.status === 'in-progress' ? 'In progress' : job.status.charAt(0).toUpperCase() + job.status.slice(1);
  let nextTitle = 'Your request is with the company.';
  let nextText = 'The company will accept or reject the job before sending a quote.';
  if (job.status === 'rejected') { nextTitle = 'The company declined this request.'; nextText = 'You can return to the marketplace and choose another company.'; }
  else if (closed) { nextTitle = 'This project is closed.'; nextText = 'Its saved details remain available here.'; }
  else if (review) { nextTitle = 'Your next step: review the quote.'; nextText = `The company sent a quote of ${formatCurrency(job.quote)}. It needs your acceptance.`; }
  else if (job.status === 'completed') { nextTitle = 'Your project is completed.'; nextText = 'Job completion and payment outcome are tracked separately.'; }
  else if (progressing) { nextTitle = 'Work has started on your project.'; nextText = 'Follow the job here. Your payment status is shown separately below.'; }
  else if (job.paymentStatus != null) { nextTitle = `Your simulated payment is ${paymentLabel(job).toLowerCase()}.`; nextText = paymentMessage(job); }
  else if (job.quoteAcceptedAt) { nextTitle = 'Your quote is accepted.'; nextText = 'You can now submit a simulated payment request.'; }
  else if (job.status === 'accepted') { nextTitle = 'The company accepted your project.'; nextText = 'Your company will send a quote for your review.'; }

  async function cancel() {
    if (cancelling || !canCancelProject(job) || !window.confirm('Cancel this project? Its saved details will remain available.')) return;
    setCancelling(true); setCancelError('');
    try { await cancelJob(job.jobId); }
    catch (reason) { setCancelError(reason instanceof Error ? reason.message : 'Could not cancel the project.'); }
    finally { setCancelling(false); }
  }
  const milestones = [
    { title: 'Company accepted', done: !!job.acceptedAt, current: false, text: job.acceptedAt ? projectDate(job.acceptedAt) : 'Awaiting company' },
    { title: 'Quote sent', done: !!job.quoteSentAt, current: job.status === 'accepted' && !job.quoteSentAt, text: job.quoteSentAt ? projectDate(job.quoteSentAt) : 'Not sent' },
    { title: 'You accept the quote', done: !!job.quoteAcceptedAt, current: review, text: job.quoteAcceptedAt ? projectDate(job.quoteAcceptedAt) : 'Awaiting your review' },
    { title: 'Work in progress', done: job.status === 'completed', current: progressing && job.status !== 'completed', text: job.status === 'completed' ? 'Work finished' : progressing ? 'Current stage' : 'Not started' },
    { title: 'Project completed', done: job.status === 'completed', current: false, text: job.status === 'completed' ? 'Completed' : 'Still to come' },
  ];
  return <div className={styles.page}>
    <Link className={styles.back} to="/my-jobs">← Back to my projects</Link>
    <div className={styles.detailheading}><div><span className={styles.eyebrow}>Project details</span><h1 title={projectTitle(job)}>{projectTitle(job)}</h1><p>{job.companyName || 'Company unavailable'}{job.address?.city && ` · ${job.address.city}`}</p><span className={styles.reference} title={`Project reference: ${job.jobId}`}>Project · {job.jobId.slice(-6).toUpperCase()}</span></div><div className={styles.headingactions}><span className={`${styles.projectbadge} ${progressing ? styles.green : ''}`}>{label}</span>{canCancelProject(job) && <button className={styles.quietbutton} onClick={() => void cancel()} disabled={cancelling}>{cancelling ? 'Cancelling…' : 'Cancel project'}</button>}</div></div>
    {cancelError && <div className={`${styles.statebox} ${styles.failed}`} role="alert"><p>{cancelError}</p><button className={styles.outlineaction} onClick={refreshJobs}>Refresh project</button></div>}
    <section className={styles.nextaction}><div className={styles.symbol} aria-hidden="true">↗</div><div className={styles.actioncopy}><strong>{nextTitle}</strong><p>{nextText}</p></div>{actionable && !closed && <Link to={`/quotes/${job.jobId}`}>{review ? 'Review quote' : 'View quote & payment'} →</Link>}{job.status === 'rejected' && <Link to="/marketplace">Browse companies →</Link>}</section>
    <div className={styles.detailgrid}><div className={styles.leftstack}>
      <section className={`${styles.panel} ${styles.overview}`}><span className={styles.smallheading}>The project</span><h2>What you requested</h2><p className={styles.scope}>{job.jobDescription}</p><p className={styles.descriptionnote}>Project description provided in your request.</p></section>
      <div className={styles.projectsubgrid}><section className={styles.panel}><span className={styles.smallheading}>Planned dates</span><h2>Your schedule</h2><dl className={styles.schedulelist}><div><dt>Start</dt><dd>{projectDate(job.startDate)}</dd></div><div><dt>End</dt><dd>{projectDate(job.endDate)}</dd></div><div><dt>Working days</dt><dd>{job.daysWorking} days</dd></div></dl></section><section className={styles.panel}><span className={styles.smallheading}>On site</span><h2>Project location</h2><p className={styles.siteaddress}>{job.address ? <>{[job.address.streetAddress, job.address.suburb].filter(Boolean).join(', ')}<br />{job.address.city}<br />{job.address.province} {job.address.postalCode}</> : 'Location unavailable'}</p></section></div>
      <section className={styles.panel}><div className={styles.companypanel}><div className={styles.monogram} aria-hidden="true">{(job.companyName || 'Company').split(' ').slice(0, 2).map(word => word[0]).join('')}</div><div><h2>{job.companyName || 'Company unavailable'}</h2><p>Your selected company</p></div><Link to={`/companies/${job.companyId}`}>View company ↗</Link></div><p className={styles.staffnote}>Your company manages worker assignments for this project.</p></section>
    </div><aside className={styles.projectaside}>
      <section className={styles.panel}><h2>Quote &amp; payment</h2><span className={styles.moneylabel}>Company quote</span><div className={styles.moneyvalue}>{job.quote > 0 ? formatCurrency(job.quote) : 'Not quoted yet'}</div><span className={styles.moneylabel}>{projectQuoteNote(job)}</span><div className={styles.paymentline}><span>Demo payment</span><strong>{paymentLabel(job)}</strong></div><p className={styles.paymenthint}>{closed && job.paymentStatus == null ? 'No new payment requests are available for this closed project.' : paymentMessage(job)}</p>{job.paymentReference && <p className={styles.savedReference}>Demo reference: {job.paymentReference}</p>}{job.paymentStatus != null && <div className={styles.paymentline}><span>Amount marked paid</span><strong>{formatCurrency(job.amountPaid ?? 0)}</strong></div>}{job.quote > 0 && !closed && <Link className={styles.outlineaction} to={`/quotes/${job.jobId}`}>{review ? 'Review quote' : 'View quote & payment'} →</Link>}<div className={styles.simbox}><strong>Payments are simulated</strong>No money moves. An administrator sets each demo payment outcome.</div></section>
      <section className={styles.panel}><h2>Project progress</h2>{closed ? <p className={styles.closednote}>{job.status === 'rejected' ? 'The company rejected this request.' : 'This project is closed.'} Its saved details are retained.</p> : <ol className={styles.timeline}>{milestones.map(m => <li key={m.title} className={m.done ? styles.done : m.current ? styles.current : ''} aria-current={m.current ? 'step' : undefined}><strong>{m.title}</strong><small>{m.text}</small></li>)}</ol>}</section>
    </aside></div><footer className={styles.footnote}><span>Your request. Your quote. Your project.</span><span>Payments are simulated.</span></footer>
  </div>;
}

export default function CustomerJobDetails() {
  const { jobId } = useParams<{ jobId: string }>();
  const { getJobById, loading, error, refreshJobs } = useCustomerJobs();
  const job = jobId ? getJobById(jobId) : undefined;
  return <CustomerPageLayout title="Project details">
    {loading ? <section className={styles.state} role="status"><h2>Loading your project</h2></section>
      : error ? <section className={styles.state} role="alert"><h2>We couldn’t load your project</h2><p>{error}</p><button className={styles.fullbutton} onClick={refreshJobs}>Try again</button></section>
      : !job || job.customerId !== getCurrentCustomerId() ? <section className={styles.state}><h2>Project not found</h2><p>This project is unavailable for your account.</p><Link className={styles.outlineaction} to="/my-jobs">Back to my projects</Link></section>
      : <Details key={job.jobId} job={job} />}
  </CustomerPageLayout>;
}
