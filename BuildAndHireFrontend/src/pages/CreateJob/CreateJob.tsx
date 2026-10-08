import { useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Workspace, { Heading, Panel, Review, LoadState, ErrorMessage, Empty } from '../../components/Workspace/Workspace';
import { AddressForm, Field } from '../../components/Workspace/Forms';
import { emptyAddress, addressPayload } from '../../utils/workspaceForms';
import { useApiResource } from '../../hooks/useApiResource';
import { useCustomerJobs } from '../../context/CustomerJobsContext';
import type { CompanyListing } from '../../types/company';
import { AccountStatus } from '../../types/enums';
export default function CreateJob() {
  const navigate = useNavigate(), [query] = useSearchParams();
  const resource = useApiResource<CompanyListing[]>('/api/Companies');
  const companies = (resource.data ?? []).filter(c => c.status === AccountStatus.Active);
  const { createJob } = useCustomerJobs();
  const [values, setValues] = useState({ companyId: query.get('companyId') ?? '', jobDescription: '', startDate: '', endDate: '', daysWorking: '1', ...emptyAddress });
  const [phase, setPhase] = useState(0), [error, setError] = useState(''), [saving, setSaving] = useState(false);
  const submitting = useRef(false);
  const company = companies.find(c => c.companyId === values.companyId);
  const change = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { setValues(v => ({ ...v, [e.target.name]: e.target.value })); setError(''); };
  const today = new Date().toISOString().slice(0, 10);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!company) { setError('Select an approved company.'); return; }
    if (!values.jobDescription.trim()) { setError('Describe the project.'); return; }
    if (phase === 1 && (values.startDate < today || values.endDate < values.startDate)) { setError('Start must be today or later; end must be on or after start.'); return; }
    if (phase < 2) { setPhase(p => p + 1); return; }
    if (submitting.current) return;
    submitting.current = true; setSaving(true); setError('');
    try { const job = await createJob({ companyId: company.companyId, companyName: company.companyName, jobDescription: values.jobDescription, daysWorking: Number(values.daysWorking), startDate: values.startDate, endDate: values.endDate, payingMethod: null, address: addressPayload(values) }); navigate('/my-jobs/' + job.jobId, { replace: true }); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not create the project.'); }
    finally { submitting.current = false; setSaving(false); }
  };
  return <Workspace title="Create project"><Heading title="Tell us what you’re planning." description="Send a request to one company. The quote comes after they accept the job." eyebrow="START A PROJECT" /><LoadState {...resource} retry={resource.refresh} />
    {!resource.loading && !resource.error && (companies.length ? <><ol className="steps">{['Project brief', 'Dates & location', 'Review request'].map((text, i) => <li className={i === phase ? 'current' : ''} key={text}><i>{i + 1}</i>{text}</li>)}</ol><ErrorMessage error={error} />
    <div className="split"><form className="panel" onSubmit={submit}><fieldset disabled={saving} style={{ border: 0, padding: 0, margin: 0 }}>
      {phase === 0 && <><div className="formtitle"><h2>Your project brief</h2><p>A little detail helps the company understand the work.</p></div><div className="formgrid"><Field label="Company" full><select name="companyId" value={values.companyId} onChange={change} required><option value="">Select a company</option>{companies.map(c => <option key={c.companyId} value={c.companyId}>{c.companyName}</option>)}</select></Field><Field label="Describe the work" full><textarea name="jobDescription" value={values.jobDescription} onChange={change} required maxLength={1000} rows={5} /><small>{values.jobDescription.length}/1000 · Include the work and any constraints.</small></Field></div></>}
      {phase === 1 && <><div className="formtitle"><h2>Dates & location</h2><p>Include your proposed dates and the complete project address.</p></div><div className="formgrid"><Field label="Proposed start"><input type="date" name="startDate" value={values.startDate} onChange={change} min={today} required /></Field><Field label="Proposed end"><input type="date" name="endDate" value={values.endDate} onChange={change} min={values.startDate || today} required /></Field><Field label="Working days" full><input type="number" name="daysWorking" value={values.daysWorking} onChange={change} required min={1} step={1} max={3650} /></Field></div><div className="formsection"><h3 style={{ marginBottom: 18 }}>Project address</h3><AddressForm values={values} onChange={change} /></div></>}
      {phase === 2 && <><h2>One last look</h2><p className="subtext">Check the request before sending it.</p><div className="divider" /><Review items={[["Company", company?.companyName ?? 'Unavailable'], ["Project scope", values.jobDescription], ["Dates", values.startDate + ' – ' + values.endDate], ["Working days", values.daysWorking], ["Address", `${values.streetAddress}, ${values.suburb}, ${values.city}, ${values.province}, ${values.postalCode}`]]} /><div className="fieldnote">The company can accept or reject this request. You’ll accept their quote separately before work or the payment demo.</div></>}
      <div className="authactions">{phase > 0 ? <button type="button" className="textbutton" onClick={() => { setPhase(p => p - 1); setError(''); }}>← Back</button> : <Link className="textbutton" to="/my-jobs">Cancel</Link>}<small>Step {phase + 1} of 3</small><button className="primary" type="submit">{saving ? 'Sending…' : phase === 2 ? 'Send project request →' : 'Continue →'}</button></div></fieldset></form><aside className="stack"><Panel title="Your request"><strong>{company?.companyName ?? 'Choose a company'}</strong><div className="divider" /><Review items={[["Starting status", "Requested"], ["Quote", "Company will provide it"], ["Payment", "Simulated EFT after quote acceptance"]]} /></Panel><Panel title="Make your brief useful"><p>Describe the work, materials and parts of the space that need attention. Add realistic dates and a complete address.</p><p className="hint">The company sets the quote amount.</p></Panel></aside></div></> : <Empty><h2>No approved companies yet</h2><p>Check back after a company has been approved.</p><Link to="/marketplace" className="secondary">Browse marketplace</Link></Empty>)}
  </Workspace>;
}
