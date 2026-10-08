import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentCustomerId, useCustomerJobs } from '../../context/CustomerJobsContext';
import { isOpenProject, needsQuoteReview, projectQuoteNote, projectStatusLabel, projectTitle } from '../../utils/customerDashboard';
import { formatCurrency } from '../../utils/quoteMath';
import styles from './CustomerJobS.module.css';

type ProjectFilter = 'all' | 'review' | 'progress';
function formatDate(value: string): string {
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : new Intl.DateTimeFormat('en-ZA', {
    timeZone: 'UTC', day: '2-digit', month: 'short', year: 'numeric',
  }).format(date);
}
function NavIcon({ kind }: { kind: 'home' | 'companies' | 'projects' }) {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    {kind === 'home' ? <><path d="m3 10 9-7 9 7v10H3Z" /><path d="M9 20v-7h6v7" /></>
      : kind === 'companies' ? <><rect x="4" y="3" width="16" height="18" rx="1" /><path d="M8 7h2m4 0h2M8 11h2m4 0h2M8 15h2m4 0h2M10 21v-3h4v3" /></>
      : <><rect x="4" y="3" width="16" height="18" rx="1" /><path d="M8 8h8M8 12h8M8 16h5" /></>}
  </svg>;
}
export default function CustomerJobs() {
  const { jobs, loading, error, refreshJobs } = useCustomerJobs();
  const [filter, setFilter] = useState<ProjectFilter>('all');
  const [search, setSearch] = useState('');
  const customerId = getCurrentCustomerId();
  const customerJobs = jobs.filter(job => job.customerId === customerId);
  const reviewJobs = customerJobs.filter(needsQuoteReview);
  const openJobs = customerJobs.filter(isOpenProject);
  const inProgress = customerJobs.filter(job => job.status === 'in-progress' || job.status === 'working');
  const companies = new Set(openJobs.map(job => job.companyId)).size;
  const query = search.trim().toLocaleLowerCase('en-ZA');
  const visibleJobs = customerJobs.filter(job => {
    const matches = filter === 'all' || (filter === 'review' ? needsQuoteReview(job) : job.status === 'in-progress' || job.status === 'working');
    return matches && `${job.jobDescription} ${job.companyName} ${job.jobId} ${job.address?.city ?? ''}`.toLocaleLowerCase('en-ZA').includes(query);
  }).sort((a, b) => Number(needsQuoteReview(b)) - Number(needsQuoteReview(a)));
  const nextQuote = reviewJobs[0];
  const filters: { key: ProjectFilter; label: string; count: number }[] = [
    { key: 'all', label: 'All projects', count: customerJobs.length },
    { key: 'review', label: 'Needs review', count: reviewJobs.length },
    { key: 'progress', label: 'In progress', count: inProgress.length },
  ];
  return <div className={styles.page}>
    <a className={styles.skipLink} href="#customer-projects">Skip to projects</a>
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <Link className={styles.brand} to="/home">Build <span>&amp;</span> Hire<span>.</span></Link>
        <div className={styles.workspace}>Your project space</div>
        <nav className={styles.nav} aria-label="Customer navigation">
          <Link className={styles.navlink} to="/home"><NavIcon kind="home" />Home</Link>
          <Link className={styles.navlink} to="/marketplace"><NavIcon kind="companies" />Browse companies</Link>
          <Link className={`${styles.navlink} ${styles.active}`} to="/my-jobs" aria-current="page"><NavIcon kind="projects" />My projects</Link>
        </nav>
        <div className={styles.support}><strong>A little clarity goes a long way.</strong>Review your quote and agree on the scope before work starts.</div>
        <div className={styles.account}><div className={styles.avatar} aria-hidden="true"><NavIcon kind="projects" /></div><div>Your workspace<small>Customer account</small></div></div>
      </aside>
      <div className={styles.content}>
        <header className={styles.topbar}><div>Your workspace <span className={styles.separator}>/</span><strong>My projects</strong></div><span className={styles.demo}>Simulated payments</span></header>
        <main className={styles.main} id="customer-projects" tabIndex={-1} aria-busy={loading}>
          <div className={styles.heading}><div><span className={styles.eyebrow}>Customer dashboard</span><h1>Your projects, in view.</h1><p className={styles.muted}>From the first request to the final touch.</p></div><Link className={styles.primary} to="/my-jobs/new"><span aria-hidden="true">+</span>Post a project</Link></div>
          {loading ? <section className={styles.state} role="status"><div className={styles.spinner} aria-hidden="true" /><h2>Loading your projects</h2><p>Getting your latest requests and quotes.</p></section>
            : error ? <section className={styles.state} role="alert"><h2>We couldn’t load your projects</h2><p>{error}</p><button className={styles.primary} type="button" onClick={refreshJobs}>Try again</button></section>
            : <>
              <section className={styles.stats} aria-label="Project summary">
                <div className={styles.stat}><span>Open projects</span><strong>{openJobs.length}</strong><small>Across {companies} {companies === 1 ? 'company' : 'companies'}</small></div>
                <div className={styles.stat}><span>Quotes to review</span><strong>{reviewJobs.length}</strong><small>{reviewJobs.length ? 'Your next step is ready' : 'You’re all caught up'}</small></div>
                <div className={styles.stat}><span>In progress</span><strong>{inProgress.length}</strong><small>{inProgress.length ? 'Work has started' : 'No work started yet'}</small></div>
              </section>
              {nextQuote && <section className={styles.attention} aria-label="Quote awaiting review"><div className={styles.symbol} aria-hidden="true">↗</div><div className={styles.attentionText}><strong>{reviewJobs.length === 1 ? 'Your project quote is ready.' : `${reviewJobs.length} project quotes need your review.`}</strong><p>{nextQuote.companyName || 'Your company'} sent a quote of {formatCurrency(nextQuote.quote)}.</p></div><Link to={`/quotes/${nextQuote.jobId}`}>Review quote <span aria-hidden="true">→</span></Link></section>}
              <div className={styles.sectiontitle}><h2>My projects</h2><span aria-live="polite" role="status">{visibleJobs.length} of {customerJobs.length} {customerJobs.length === 1 ? 'project' : 'projects'}</span></div>
              {customerJobs.length > 0 && <div className={styles.tools}><div className={styles.tabs} role="group" aria-label="Filter projects">{filters.map(item => <button type="button" key={item.key} className={`${styles.tab} ${filter === item.key ? styles.active : ''}`} aria-pressed={filter === item.key} onClick={() => setFilter(item.key)}>{item.label}<small>{item.count}</small></button>)}</div><input className={styles.search} type="search" aria-label="Search projects" placeholder="Search your projects…" value={search} onChange={event => setSearch(event.target.value)} /></div>}
              {visibleJobs.length ? <section className={styles.projects} aria-label="Projects">{visibleJobs.map(job => {
                const review = needsQuoteReview(job);
                const progressing = job.status === 'in-progress' || job.status === 'working';
                return <article className={styles.project} key={job.jobId}>
                  <div className={styles.projectInfo}><div className={styles.overline} title={`Project reference: ${job.jobId}`}>Project · {job.jobId.slice(-6).toUpperCase()}</div><h3 title={projectTitle(job)}>{projectTitle(job)}</h3><div className={styles.company}>{job.companyName || 'Company unavailable'}</div><div className={styles.date}>{formatDate(job.startDate)} – {formatDate(job.endDate)}{job.address?.city && <><span aria-hidden="true">·</span>{job.address.city}</>}</div></div>
                  <div className={styles.projectSummary}><span className={`${styles.badge} ${progressing || job.status === 'completed' ? styles.green : !review ? styles.gray : ''}`}>{projectStatusLabel(job)}</span><div className={`${styles.amount} ${job.quote <= 0 ? styles.noQuote : ''}`}>{job.quote > 0 ? formatCurrency(job.quote) : job.status === 'requested' ? 'Awaiting company' : 'Awaiting quote'}<small>{projectQuoteNote(job)}</small></div></div>
                  <Link className={`${styles.projectbutton} ${review ? styles.emphasis : ''}`} to={review ? `/quotes/${job.jobId}` : `/my-jobs/${job.jobId}`} aria-label={`${review ? 'Review quote for' : 'View project:'} ${projectTitle(job)}`}>{review ? 'Review quote' : 'View project'} <span aria-hidden="true">{review ? '↗' : '→'}</span></Link>
                </article>;
              })}</section> : <section className={styles.state}><h3>{customerJobs.length ? 'No matching projects' : 'Make room for your next project.'}</h3><p>{customerJobs.length ? 'Try a different search or show all your projects.' : 'Post your first request and keep every step in view here.'}</p>{customerJobs.length ? <button type="button" className={styles.primary} onClick={() => { setSearch(''); setFilter('all'); }}>Clear filters</button> : <Link className={styles.primary} to="/my-jobs/new">Post a project</Link>}</section>}
              <footer className={styles.footnote}><span>Good projects start with clear expectations.</span><span>Payments are simulated.</span></footer>
            </>}
        </main>
      </div>
    </div>
  </div>;
}
