import { useContext } from 'react';
import { ConfirmationContext } from '../context/ConfirmationContext';

export function useConfirmation() {
  const confirm = useContext(ConfirmationContext);
  if (!confirm) throw new Error('ConfirmationProvider is required.');
  return confirm;
}
