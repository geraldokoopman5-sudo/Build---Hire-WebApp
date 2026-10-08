import type { ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AccountType } from '../../types/enums';
import { AdminRole } from '../../types/admin';
import { getStoredAccountType, getStoredAdminRole, logout } from '../../utils/auth';
import './workspace.css';

export default function Workspace({ title, children }: { title: string; children: ReactNode }) {
  const navigate = useNavigate();
  const type = getStoredAccountType();
  const superAdmin = getStoredAdminRole() === AdminRole.SuperAdmin;
  const company = type === AccountType.Company, admin = type === AccountType.Admin;
  const name = company ? 'Company workspace' : admin ? superAdmin ? 'Super admin workspace' : 'Admin workspace' : 'Customer workspace';
  const nav = company ? [['Dashboard', '/company/jobs'], ['Requests', '/company/applications'], ['Workforce', '/company/workforce']]
    : admin ? [...(superAdmin ? [['Overview', '/super-admin'], ['Administrators', '/super-admin/admins']] : []), ['Admin portal', '/admin']]
      : [['Home', '/home'], ['Marketplace', '/marketplace'], ['My projects', '/my-jobs']];
  return <div className="bh-workspace">
    <a className="skip-link" href="#workspace-main">Skip to content</a>
    <div className="layout"><aside className="sidebar">
      <Link className="brand" to={nav[0][1]}>Build<span>&amp;</span>Hire</Link><p className="workspace">{name}</p>
      <nav className="nav" aria-label={name}>{nav.map(([label, route]) => <NavLink key={route} to={route} end className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}>{label}</NavLink>)}
        <button className="navlink signout" onClick={() => { logout(); navigate('/', { replace: true }); }}>Sign out</button>
      </nav>
      <div className="sidenote"><strong>Built around your next step.</strong>Clear decisions, shared project updates, and simulated payments.</div>
      <div className="account"><span className="avatar" aria-hidden="true">○</span><div>Your workspace<small>{name}</small></div></div>
    </aside><div className="content"><header className="topbar"><span>Workspace<span className="breadcrumb-sep">/</span><strong>{title}</strong></span><span className="chip">Simulated payments</span></header>
      <main className="main" id="workspace-main" tabIndex={-1}>{children}<footer className="footer"><span>Build &amp; Hire · Your project, connected.</span><span>Payments are simulated. No money moves.</span></footer></main>
    </div></div>
  </div>;
}
export function Heading({ title, description, action, eyebrow = 'YOUR WORKSPACE' }: { title: string; description: string; action?: ReactNode; eyebrow?: string }) {
  return <div className="heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}
export function Panel({ title, children }: { title: string; children: ReactNode }) { return <section className="panel"><h2>{title}</h2>{children}</section>; }
export function Badge({ children, tone = '' }: { children: ReactNode; tone?: string }) { return <span className={`badge ${tone}`}>{children}</span>; }
export function Notice({ title, children }: { title: string; children: ReactNode }) { return <div className="notice"><div className="symbol" aria-hidden="true">↗</div><div><strong>{title}</strong>{children}</div></div>; }
export function ErrorMessage({ error, retry }: { error: string; retry?: () => void }) { return error ? <div className="error-message" role="alert"><p>{error}</p>{retry && <button className="secondary" type="button" onClick={retry}>Refresh / try again</button>}</div> : null; }
export function LoadState({ loading, error, retry }: { loading: boolean; error: string; retry: () => void }) { return <>{loading && <p role="status">Loading your workspace…</p>}<ErrorMessage error={error} retry={retry} /></>; }
export function Stats({ items }: { items: [string, number | string, string][] }) { return <div className={`stats ${items.length === 4 ? 'four' : ''}`}>{items.map(([label, count, note]) => <div className="stat" key={label}><span>{label}</span><strong>{count}</strong><small>{note}</small></div>)}</div>; }
export function Review({ items }: { items: [string, ReactNode][] }) { return <>{items.map(([label, value]) => <div className="reviewline" key={label}><span>{label}</span><strong>{value}</strong></div>)}</>; }
export function Empty({ children }: { children: ReactNode }) { return <div className="empty" style={{ display: 'block' }}>{children}</div>; }
