import CustomerNavIcon from './CustomerNavIcon';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../utils/auth';
import styles from '../../pages/CustomerJobs/CustomerJobS.module.css';


export default function CustomerSidebar() {
  const navigate = useNavigate();
  return <aside className={styles.sidebar}>
    <Link className={styles.brand} to="/home">Build<span>&amp;</span>Hire</Link>
    <div className={styles.workspace}>Customer workspace</div>
    <nav className={styles.nav} aria-label="Customer navigation">
      <Link className={styles.navlink} to="/home"><CustomerNavIcon kind="home" />Home</Link>
      <Link className={styles.navlink} to="/marketplace"><CustomerNavIcon kind="companies" />Browse companies</Link>
      <Link className={`${styles.navlink} ${styles.active}`} to="/my-jobs" aria-current="page"><CustomerNavIcon kind="projects" />My projects</Link>
      <button className={`${styles.navlink} ${styles.signout}`} type="button" onClick={() => { logout(); navigate('/', { replace: true }); }}><CustomerNavIcon kind="signout" />Sign out</button>
    </nav>
    <div className={styles.support}><strong>Every step, in one place.</strong>Review your quote and agree on the scope before work starts.</div>
    <div className={styles.account}><div className={styles.avatar} aria-hidden="true"><CustomerNavIcon kind="projects" /></div><div>Your workspace<small>Customer account</small></div></div>
  </aside>;
}
