import { Link } from 'react-router-dom';
import { Badge } from './Workspace';
import type { CompanyJob } from '../../types/job';
import { getJobStatusLabel } from '../../utils/jobLabels';
import { formatCurrency } from '../../utils/quoteMath';
import { companyPaymentLabel, jobTone } from '../../utils/companyProject';
export default function ProjectRow({ job, onReview }: { job: CompanyJob; onReview?: () => void }) {
  return <article className="projectrow"><div><h3>{job.title}</h3><p className="meta">{job.dateRange}{job.address?.city ? ' · ' + job.address.city : ''}</p></div><div><Badge tone={jobTone(job)}>{getJobStatusLabel(job.status)}</Badge><div className="amount">{job.quoteSentAt ? formatCurrency(job.quoteAmount) : 'Quote not sent'}</div><span className="payment-label">Payment: {companyPaymentLabel(job)}</span></div>{onReview ? <button className="secondary" onClick={onReview}>Review request →</button> : <Link className="secondary" to={'/company/jobs/' + job.id}>Open project →</Link>}</article>;
}
