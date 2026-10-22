import type { ComponentProps } from 'react';
import styles from './DateInput.module.css';

function openCalendar(input: HTMLInputElement) {
  if (input.disabled || input.readOnly) return;
  try {
    input.showPicker?.();
  } catch {
    // Keep the native calendar control usable when programmatic opening is unavailable.
    input.focus();
  }
}

export default function DateInput({ className = '', ...props }: Omit<ComponentProps<'input'>, 'type' | 'onClick' | 'onKeyDown'>) {
  return <input {...props} type="date" className={`${styles.input} ${className}`}
    onClick={event => openCalendar(event.currentTarget)}
    onKeyDown={event => {
      if (event.key === 'Enter' || event.key === ' ' || (event.altKey && event.key === 'ArrowDown')) {
        event.preventDefault();
        openCalendar(event.currentTarget);
      }
    }} />;
}
