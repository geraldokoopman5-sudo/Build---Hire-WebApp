import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Workspace, { Badge, Panel, Review, LoadState, Empty, ErrorMessage } from '../../components/Workspace/Workspace';
import { useApiResource } from '../../hooks/useApiResource';
import { useConfirmation } from '../../hooks/useConfirmation';
import { useProfile } from '../../context/ProfileContext';
import { getStoredAccountType } from '../../utils/auth';
import { apiRequest } from '../../utils/api';
import { AccountType, AccountStatus } from '../../types/enums';
import type { BusinessInformation, CompletedWorkPost } from '../../types/completedWork';
import CompletedWorkForm from '../../components/CompletedWork/CompletedWorkForm';
import ApiPhoto from '../../components/ProfilePhoto/ApiPhoto';

export default function CompanyProfile() {
  const { id } = useParams();
  const { profile } = useProfile();
  const isCompany = getStoredAccountType() === AccountType.Company;
  const isCustomer = getStoredAccountType() === AccountType.Customer;
  const companyId = id ?? (isCompany ? profile?.accountId ?? localStorage.getItem('buildandhire.companyId') : null);
  const resource = useApiResource<BusinessInformation>(`/api/Companies/${companyId}/business-information`, !!companyId);
  const company = resource.data;
  const ownsPage = isCompany && companyId === profile?.accountId;
  const confirm = useConfirmation();
  const [editor, setEditor] = useState<CompletedWorkPost | 'new' | null>(null);
  const [error, setError] = useState('');
  const [removing, setRemoving] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const remove = async (post: CompletedWorkPost) => {
    if (removing || !await confirm(`Remove “${post.title}” from your business information page?`, { confirmLabel: 'Remove post' })) return;
    setRemoving(post.id); setError(''); setMessage('');
    try { await apiRequest(`/api/Companies/me/completed-work/${post.id}`, { method: 'DELETE' }); resource.refresh(); setMessage('Completed-work post removed.'); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not remove this post.'); }
    finally { setRemoving(null); }
  };
  const formatDate = (date: string) => new Date(date + 'T00:00:00Z').toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  return <Workspace title="Business information">
    {isCustomer && <p style={{ marginBottom: 24 }}><Link className="textbutton" to="/marketplace">← Back to marketplace</Link></p>}
    <LoadState {...resource} retry={resource.refresh} />
    {company && <>
      <div className="profilehero"><div className="profilehead">
        {company.photoDataUrl ? <img className="business-photo" src={company.photoDataUrl} alt={`${company.companyName} profile`} /> : <div className="companymark profilemark" aria-hidden="true">{company.companyName.slice(0, 2).toUpperCase()}</div>}
        <span className="eyebrow">BUSINESS INFORMATION</span><h1>{company.companyName}</h1>
        <p className="subtext">{[company.city, company.province].filter(Boolean).join(', ')}</p>
        <Badge tone={company.status === AccountStatus.Active ? 'green' : ''}>{company.status === AccountStatus.Active ? 'Approved account' : 'Account not active'}</Badge>
      </div><div className="profileaction">
        {isCustomer ? <><span className="eyebrow">HAVE A PROJECT IN MIND?</span><h2>Make the first move.</h2><p>Share the scope, proposed dates and location. The company will review your request before sending a quote.</p><Link className="primary wide" to={'/my-jobs/new?companyId=' + company.companyId}>Request a project →</Link><p className="hint">Creating a request does not commit you to a quote or a payment.</p></>
          : <><span className="eyebrow">{ownsPage ? 'YOUR COMPANY, AT A GLANCE' : 'COMPANY PROFILE'}</span><h2>Let your work speak.</h2><p>Explore the finished projects shared by this company.</p>{ownsPage && <Link className="secondary" to="/profile">Change company photo</Link>}</>}
      </div></div>
      <section aria-labelledby="completed-work-title" data-completed-work>
        <div className="portfolio-header"><div><span className="eyebrow">THE FINISHED RESULT</span><h2 id="completed-work-title">Completed work</h2><p>Past projects and completed Build &amp; Hire jobs, shared by {company.companyName}.</p></div>
          {ownsPage && <button className="primary" onClick={() => { setEditor('new'); setMessage(''); }}>+ Add completed work</button>}</div>
        <ErrorMessage error={error} />{message && <p className="photo-success" role="status">{message}</p>}
        {company.completedWork.length ? <div className="portfolio-grid">{company.completedWork.map(post => <article className="portfolio-card" key={post.id}>
          <div className="portfolio-cover"><ApiPhoto path={post.photoUrl} alt={post.title} /></div>
          <div className="portfolio-copy"><Badge tone={post.jobId ? 'green' : ''}>{post.jobId ? 'Completed in Build & Hire' : 'Past project'}</Badge>
            <h3>{post.title}</h3><p className="portfolio-description">{post.description}</p><div className="portfolio-meta"><span>Completed {formatDate(post.completedOn)}</span>{post.location && <span>{post.location}</span>}</div>
            {ownsPage && <div className="photo-actions"><button className="secondary" onClick={() => setEditor(post)}>Edit post</button><button className="textbutton" disabled={!!removing} onClick={() => remove(post)}>{removing === post.id ? 'Removing…' : 'Remove post'}</button></div>}
          </div></article>)}</div> : <div className="portfolio-empty"><h3>{ownsPage ? 'Good work deserves to be seen.' : 'No completed work shared yet.'}</h3><p>{ownsPage ? 'Add a finished project with a photo, description and completion date. It will appear here for visitors to your business information page.' : 'This company has not published any finished projects yet.'}</p></div>}
      </section>
      {isCustomer && <div className="panels" style={{ marginTop: 30 }}><Panel title="What happens next"><Review items={[["01 · Send a request", "Describe your project"], ["02 · Company reviews it", "Accepts or rejects the job"], ["03 · Review their quote", "You choose whether to accept"], ["04 · Work begins", "Company manages the project"]]} /></Panel><Panel title="Keep decisions in your workspace"><p>Review the company’s quote before accepting it. Project status and payment status are tracked separately.</p><div className="divider" /><p>Payments in this application are simulated. No bank transfer or card charge is made.</p></Panel></div>}
    </>}
    {!resource.loading && !resource.error && !company && <Empty><h1>Company not found</h1><p>This company may no longer be approved.</p></Empty>}
    {editor && ownsPage && <CompletedWorkForm post={editor === 'new' ? undefined : editor} onClose={() => setEditor(null)} onSaved={() => { setEditor(null); resource.refresh(); setMessage('Your completed work has been published on this page.'); }} />}
  </Workspace>;
}
