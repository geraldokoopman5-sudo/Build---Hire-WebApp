import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { ConfirmationOptions } from '../../context/ConfirmationContext';
import styles from './ConfirmationDialog.module.css';

interface ConfirmationDialogProps extends ConfirmationOptions {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationDialog({
  title = 'Please confirm', message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel,
}: ConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => {
      dialog?.close();
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, []);

  return createPortal(
    <dialog ref={dialogRef} className={styles.dialog} role="alertdialog" aria-modal="true"
      aria-labelledby={titleId} aria-describedby={descriptionId} data-confirmation-dialog
      onCancel={event => { event.preventDefault(); onCancel(); }}>
      <h2 id={titleId}>{title}</h2>
      <p id={descriptionId}>{message}</p>
      <div className={styles.actions}>
        <button type="button" className={styles.cancel} onClick={onCancel}>{cancelLabel}</button>
        <button type="button" className={styles.confirm} onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </dialog>, document.body
  );
}
