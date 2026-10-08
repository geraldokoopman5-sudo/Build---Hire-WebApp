import { Link } from 'react-router-dom';
import { getStoredAccountType, getStoredAdminRole, getPostLoginRoute } from '../../utils/auth';
import { AccountType } from '../../types/enums';
import '../../components/Workspace/workspace.css';
export default function NotFound() {
  const type = getStoredAccountType();
  const workspace = type ? getPostLoginRoute(type, getStoredAdminRole()) : '/';
  return <div className="bh-workspace"><div className="errorpage"><header className="errorheader"><Link className="brand" to={workspace}>Build<span>&amp;</span>Hire</Link></header><main className="errorcontent"><span className="eyebrow">LET’S GET YOU BACK ON TRACK</span><div className="errorcode" aria-hidden="true">404</div><h1>This page isn’t on the plan.</h1><p>The link may have changed, or the address may be incomplete. Your workspace is a good place to pick things up again.</p><div className="buttonrow"><Link className="primary" to={workspace}>{type ? 'Back to workspace →' : 'Go to sign in →'}</Link>{type === AccountType.Customer && <Link className="secondary" to="/my-jobs">My projects</Link>}</div><div className="divider" /><p className="hint">Need to sign in again? <Link className="textbutton" to="/">Go to the login page →</Link></p></main><footer className="footer"><span>Build &amp; Hire</span><span>Find your next step.</span></footer></div></div>;
}
