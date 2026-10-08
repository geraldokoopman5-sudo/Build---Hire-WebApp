import { Link, useParams } from 'react-router-dom';
import Workspace, { Badge, Panel, Review, LoadState, Empty } from '../../components/Workspace/Workspace';
import { useApiResource } from '../../hooks/useApiResource';
import { AccountStatus } from '../../types/enums';
import type { CompanyListing } from '../../types/company';
export default function CompanyProfile() {
  const { id } = useParams();
  const resource = useApiResource<CompanyListing[]>('/api/Companies');
  const company = resource.data?.find(c => c.companyId === id && c.status === AccountStatus.Active);
  return <Workspace title="Company profile"><p style={{ marginBottom: 24 }}><Link className="textbutton" to="/marketplace">← Back to marketplace</Link></p><LoadState {...resource} retry={resource.refresh} />
    {!resource.loading && !resource.error && (company ? <><div className="profilehero"><div className="profilehead"><div className="companymark profilemark" aria-hidden="true">{company.companyName.slice(0, 2).toUpperCase()}</div><h1>{company.companyName}</h1><p className="subtext">An approved company account on Build &amp; Hire.</p><Badge tone="green">Approved account</Badge></div><div className="profileaction"><span className="eyebrow">HAVE A PROJECT IN MIND?</span><h2>Make the first move.</h2><p>Share the scope, proposed dates and location. The company will review your request before sending a quote.</p><Link className="primary wide" to={'/my-jobs/new?companyId=' + company.companyId}>Request a project →</Link><p className="hint">Creating a request does not commit you to a quote or a payment.</p></div></div><div className="panels"><Panel title="What happens next"><Review items={[["01 · Send a request", "Describe your project"], ["02 · Company reviews it", "Accepts or rejects the job"], ["03 · Review their quote", "You choose whether to accept"], ["04 · Work begins", "Company manages the project"]]} /></Panel><Panel title="Keep decisions in your workspace"><p>Review the company’s quote before accepting it. Project status and payment status are tracked separately.</p><div className="divider" /><p>Payments in this application are simulated. No bank transfer or card charge is made.</p></Panel></div></> : <Empty><h1>Company not found</h1><p>This company may no longer be approved.</p><Link to="/marketplace" className="secondary">Browse companies</Link></Empty>)}
  </Workspace>;
}
