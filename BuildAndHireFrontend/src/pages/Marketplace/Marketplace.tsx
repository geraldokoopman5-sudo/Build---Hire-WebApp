import { useState } from 'react';
import { Link } from 'react-router-dom';
import Workspace, { Heading, Badge, LoadState, Empty } from '../../components/Workspace/Workspace';
import { useApiResource } from '../../hooks/useApiResource';
import { AccountStatus } from '../../types/enums';
import type { CompanyListing } from '../../types/company';
export default function Marketplace() {
  const resource = useApiResource<CompanyListing[]>('/api/Companies');
  const [search, setSearch] = useState('');
  const companies = (resource.data ?? []).filter(c => c.status === AccountStatus.Active && c.companyName.toLowerCase().includes(search.trim().toLowerCase()));
  return <Workspace title="Marketplace"><Heading title="Find your project partner" description="Browse approved companies. Choose a company to see its profile and send a request." eyebrow="THE MARKETPLACE" action={<Link className="primary" to="/my-jobs/new">Create a project →</Link>} /><LoadState {...resource} retry={resource.refresh} />
    {!resource.loading && !resource.error && <><div className="toolbar"><p className="subtext"><strong>{companies.length}</strong> approved company accounts</p><input className="search" type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search company name…" aria-label="Search company name" /></div><div className="panels three">{companies.map(c => <article className="panel companytile" key={c.companyId}><div className="companymark" aria-hidden="true">{c.companyName.slice(0, 2).toUpperCase()}</div><Badge tone="green">Approved account</Badge><h3>{c.companyName}</h3><p>View this company and send a project request.</p><div className="divider" /><Link className="secondary" to={'/companies/' + c.companyId}>View company →</Link></article>)}</div>{companies.length === 0 && <Empty><h2>No companies found</h2><p>Try another name, or check back after companies are approved.</p>{search && <button className="secondary" onClick={() => setSearch('')}>Clear search</button>}</Empty>}<div className="fieldnote">Approval refers to the company’s account status. Discuss your project requirements with the company before accepting a quote.</div></>}
  </Workspace>;
}
