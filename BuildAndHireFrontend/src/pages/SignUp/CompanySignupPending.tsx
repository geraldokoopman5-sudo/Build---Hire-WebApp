import { Link } from 'react-router-dom';
import '../../components/Workspace/workspace.css';

export default function CompanySignupPending() {
  return (
    <div className="bh-workspace">
      <div className="authpage">
        <aside className="authstory">
          <Link className="brand" to="/">Build<span>&amp;</span>Hire</Link>
          <span className="eyebrow">COMPANY ACCOUNT</span>
          <h1>Your next project starts here.</h1>
          <p>Your company workspace will be ready after administrator approval.</p>
        </aside>
        <main className="authmain">
          <span className="eyebrow">REGISTRATION COMPLETE</span>
          <h1>Your company account is registered.</h1>
          <div className="successnote" role="status">
            Your account is awaiting administrator approval. You can sign in and open
            your company workspace once it is approved.
          </div>
          <Link className="primary" style={{ marginTop: 22 }} to="/">
            Go to sign in →
          </Link>
        </main>
      </div>
    </div>
  );
}
