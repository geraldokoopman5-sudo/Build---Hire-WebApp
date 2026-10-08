import { useState } from 'react';
import { Link } from 'react-router-dom';
import Workspace, { Heading, Stats, Notice, Empty, LoadState } from '../../components/Workspace/Workspace';
import ProjectRow from '../../components/Workspace/ProjectRow';
import { useCompanyJobs } from '../../context/CompanyJobsContext';
import { getJobStatusLabel } from '../../utils/jobLabels';
import type { JobStatus } from '../../types/job';
export default function CompanyJobs() {
  const { jobs, loading, error, refreshJobs } = useCompanyJobs();
  const [filter, setFilter] = useState<JobStatus | 'all'>('all'), [search, setSearch] = useState('');
  const pending = jobs.filter(j => j.status === 'requested').length;
  const visible = jobs.filter(j => (filter === 'all' || j.status === filter) && j.description.toLowerCase().includes(search.trim().toLowerCase()));
  const states: (JobStatus | 'all')[] = ['all', 'requested', 'accepted', 'in-progress', 'completed', 'cancelled', 'rejected'];
  return <Workspace title="Company dashboard"><Heading title="Good work starts here." description="Review requests, agree on quotes and keep accepted projects moving." eyebrow="COMPANY WORKSPACE" action={<Link className="primary" to="/company/applications">Review requests →</Link>} /><LoadState loading={loading} error={error} retry={refreshJobs} />
  {!loading && !error && <><Stats items={[["Incoming requests", pending, "Awaiting your decision"], ["Accepted jobs", jobs.filter(j => j.status === 'accepted').length, "Ready for the next step"], ["In progress", jobs.filter(j => j.status === 'in-progress').length, "Work has started"], ["Completed", jobs.filter(j => j.status === 'completed').length, "Closed projects"]]} />{pending > 0 && <Notice title={`${pending} request${pending === 1 ? '' : 's'} need a decision`}>Accept a request before quoting or assigning workers. <Link className="textbutton" to="/company/applications">Open requests →</Link></Notice>}
  <div className="sectionhead"><h2>Your projects</h2><small>All project states in one place</small></div><div className="toolbar"><div className="tabs" role="group" aria-label="Project status">{states.map(s => <button key={s} className={`tab ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)} aria-pressed={filter === s}>{s === 'all' ? 'All' : getJobStatusLabel(s)}</button>)}</div><input className="search" aria-label="Search projects" placeholder="Search project…" type="search" value={search} onChange={e => setSearch(e.target.value)} /></div><div className="rowlist">{visible.map(j => <ProjectRow job={j} key={j.id} />)}</div>{!visible.length && <Empty>No projects match this view.</Empty>}</>}
  </Workspace>;
}
