import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../utils/auth';
import { useConfirmation } from '../../hooks/useConfirmation';

export default function SignOutButton({ className, children = 'Sign out' }: {
  className?: string;
  children?: ReactNode;
}) {
  const confirm = useConfirmation();
  const navigate = useNavigate();

  async function confirmSignOut() {
    if (!(await confirm('Are you sure you want to sign out?', {
      title: 'Sign out?', confirmLabel: 'Yes', cancelLabel: 'No',
    }))) return;
    logout();
    navigate('/', { replace: true });
  }

  return <button type="button" className={className} onClick={() => void confirmSignOut()}>{children}</button>;
}
