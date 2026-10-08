import { useRef, useState, type FormEvent, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { ErrorMessage } from '../../components/Workspace/Workspace';
import { AddressForm, Field } from '../../components/Workspace/Forms';
import { emptyAddress, addressPayload } from '../../utils/workspaceForms';
import { apiRequest } from '../../utils/api';
import '../../components/Workspace/workspace.css';
export default function SignUp() {
  const [role, setRole] = useState<'customer' | 'company'>('customer'), [phase, setPhase] = useState(0);
  const [values, setValues] = useState({ name: '', email: '', password: '', confirmPassword: '', registrationNumber: '', taxNumber: '', ...emptyAddress });
  const [error, setError] = useState(''), [saving, setSaving] = useState(false), [complete, setComplete] = useState(false);
  const submitting = useRef(false);
  const change = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { setValues(v => ({ ...v, [event.target.name]: event.target.value })); setError(''); };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!values.name.trim()) { setError('A name is required.'); return; }
    if (values.password !== values.confirmPassword) { setError('Passwords must match.'); return; }
    if (phase === 0) { setPhase(1); setError(''); return; }
    if (submitting.current) return;
    submitting.current = true; setSaving(true); setError('');
    const shared = { password: values.password, address: addressPayload(values) };
    try { await apiRequest(role === 'company' ? '/api/Companies' : '/api/Customer', { method: 'POST', body: JSON.stringify(role === 'company' ? { ...shared, companyName: values.name.trim(), companyEmail: values.email.trim(), registrationNumber: values.registrationNumber, taxNumber: values.taxNumber } : { ...shared, customerName: values.name.trim(), email: values.email.trim() }) }); setComplete(true); setValues(v => ({ ...v, password: '', confirmPassword: '' })); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not create your account.'); }
    finally { submitting.current = false; setSaving(false); }
  };
  return <div className="bh-workspace"><div className="authpage"><aside className="authstory"><Link className="brand" to="/">Build<span>&amp;</span>Hire</Link><span className="eyebrow">START SOMETHING GOOD</span><h1>The right people.<br />The next project.</h1><p>Join a workspace that keeps project requests, quotes, workers and updates connected.</p><div className="checkitem">01 · Choose your account type</div><div className="checkitem">02 · Add your details and address</div><div className="checkitem">03 · Begin your next project</div><small>Payments are simulated throughout this demo.</small></aside><main className="authmain"><div className="titleline"><small>Already registered?</small><Link className="textbutton" to="/">Sign in →</Link></div><span className="eyebrow">WELCOME TO BUILD &amp; HIRE</span><h1>{complete ? 'Your account is registered.' : 'Create your account'}</h1>
    {complete ? <><div className="successnote" role="status">{role === 'company' ? 'Your company is awaiting administrator approval. You can sign in after it is approved.' : 'Your customer account is ready. Sign in to start a project.'}</div><Link className="primary" style={{ marginTop: 22 }} to="/">Go to sign in →</Link></> : <><p className="subtext">A few details, then you’re on your way.</p><div className="authprogress"><span className={phase === 0 ? 'active' : ''}>01 · Account details</span><span className={phase === 1 ? 'active' : ''}>02 · Your address</span></div><ErrorMessage error={error} /><form onSubmit={submit}><fieldset disabled={saving} style={{ border: 0, padding: 0, margin: 0 }}>
    {phase === 0 ? <><div className="rolechoices">{(['customer', 'company'] as const).map(r => <button className={`rolecard ${r === role ? 'active' : ''}`} key={r} type="button" aria-pressed={r === role} onClick={() => { setRole(r); setError(''); }}><strong>I’m a {r}</strong><small>{r === 'customer' ? 'Find a company and manage my projects.' : 'Review requests and manage my team.'}</small></button>)}</div><div className="formgrid"><Field label={role === 'company' ? 'Company name' : 'Full name'} full><input name="name" value={values.name} onChange={change} required maxLength={100} autoComplete="name" /></Field><Field label="Email address" full><input name="email" value={values.email} onChange={change} required type="email" autoComplete="email" /></Field><Field label="Password"><input name="password" value={values.password} onChange={change} required type="password" minLength={12} autoComplete="new-password" /></Field><Field label="Confirm password"><input name="confirmPassword" value={values.confirmPassword} onChange={change} required type="password" minLength={12} autoComplete="new-password" /></Field></div><p className="hint">Use at least 12 characters for your password.</p>
    {role === 'company' && <><div className="formgrid" style={{ marginTop: 20 }}>{(['registrationNumber', 'taxNumber'] as const).map((name, i) => <Field key={name} label={i ? 'Tax number' : 'Registration number'}><input name={name} value={values[name]} onChange={change} required pattern="[0-9]{10}" maxLength={10} inputMode="numeric" /></Field>)}</div><div className="fieldnote">Registration and tax numbers need 10 digits. Company accounts require administrator approval.</div></>}</> : <><h2 style={{ marginBottom: 20 }}>Your address</h2><AddressForm values={values} onChange={change} /></>}
    <div className="authactions">{phase === 1 ? <button className="textbutton" type="button" onClick={() => { setPhase(0); setError(''); }}>← Back</button> : <small>Step 1 of 2</small>}<button className="primary" type="submit">{saving ? 'Registering…' : phase === 1 ? 'Create account →' : 'Continue →'}</button></div></fieldset></form></>}
  </main></div></div>;
}
