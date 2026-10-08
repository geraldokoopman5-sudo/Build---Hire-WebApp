import { Link } from 'react-router-dom';
import Workspace, { Heading, Stats, Panel, Badge, LoadState } from '../../components/Workspace/Workspace';
import { useAdminManagement } from '../../context/AdminManagementContext';
import { AdminRole } from '../../types/admin';
import { AccountStatus } from '../../types/enums';
export default function SuperAdminDashboard() {
  const { admins, loading, error, refreshAdmins } = useAdminManagement();
  return <Workspace title="Super admin dashboard"><Heading title="A clear view of your admin team." description="Manage administrator access and open the platform review workspace." eyebrow="SUPER ADMIN WORKSPACE" /><LoadState loading={loading} error={error} retry={refreshAdmins} />
  {!loading && !error && <Stats items={[["Administrators", admins.length, "All administrator accounts"], ["Active accounts", admins.filter(a => a.status === AccountStatus.Active).length, "Currently enabled"], ["Super admins", admins.filter(a => a.adminRole === AdminRole.SuperAdmin).length, "Privileged role"]]} />}
  <div className="panels"><Panel title="Administrator management"><p>Add an administrator, update their role, or manage account access. Password changes are optional when editing an account.</p><div className="divider" /><Link className="primary" to="/super-admin/admins">Manage administrators →</Link></Panel><Panel title="Platform review"><p>Review pending company registrations, customer accounts and simulated payment outcomes in the admin portal.</p><div className="divider" /><Link className="secondary" to="/admin">Open admin portal →</Link></Panel></div>
  {!loading && !error && <><div className="sectionhead"><h2>Your administrator accounts</h2><Link className="textbutton" to="/super-admin/admins">View all →</Link></div><div className="tablewrap"><table><thead><tr><th>Administrator</th><th>Role</th><th>Status</th></tr></thead><tbody>{admins.slice(0, 5).map(a => <tr key={a.adminId}><td><strong>{a.userName}</strong><small>{a.email}</small></td><td data-label="Role">{a.adminRole === AdminRole.SuperAdmin ? 'Super admin' : 'Admin'}</td><td data-label="Status"><Badge tone={a.status === AccountStatus.Active ? 'green' : 'gray'}>{a.status === AccountStatus.Active ? 'Active' : 'Inactive'}</Badge></td></tr>)}</tbody></table></div></>}
  <div className="fieldnote">Keep privileged access deliberate. Confirm role and account-status changes before saving them.</div></Workspace>;
}
