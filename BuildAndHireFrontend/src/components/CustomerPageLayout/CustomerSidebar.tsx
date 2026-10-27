import CustomerNavIcon from './CustomerNavIcon';
import { Link } from 'react-router-dom';
import SignOutButton from '../SignOutButton/SignOutButton';
import ProfileAccount from '../ProfilePhoto/ProfileAccount';
import styles from '../../pages/CustomerJobs/CustomerJobS.module.css';


export default function CustomerSidebar() {
  return <aside className={styles.sidebar}>
    <Link className={styles.brand} to="/home">Build<span>&amp;</span>Hire</Link>
    <div className={styles.workspace}>Customer workspace</div>
    <nav className={styles.nav} aria-label="Customer navigation">
      <Link className={styles.navlink} to="/home"><CustomerNavIcon kind="home" />Home</Link>
      <Link className={styles.navlink} to="/marketplace"><CustomerNavIcon kind="companies" />Browse companies</Link>
      <Link className={`${styles.navlink} ${styles.active}`} to="/my-jobs" aria-current="page"><CustomerNavIcon kind="projects" />My projects</Link>
    </nav>
    <div className={styles.support}><strong>Every step, in one place.</strong>Review your quote and agree on the scope before work starts.</div>
    <ProfileAccount />
    <SignOutButton className={`${styles.navlink} ${styles.signout}`}><CustomerNavIcon kind="signout" />Sign out</SignOutButton>
  </aside>;
}
