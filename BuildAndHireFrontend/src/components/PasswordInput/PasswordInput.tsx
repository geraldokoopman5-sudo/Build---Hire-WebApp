import { useId, useState, type ComponentProps } from 'react';
import styles from './PasswordInput.module.css';

type PasswordInputProps = Omit<ComponentProps<'input'>, 'type' | 'children'> & {
  label?: string;
  containerClassName?: string;
  visibilityLabel?: string;
};

export default function PasswordInput({
  id,
  label,
  className = '',
  containerClassName,
  visibilityLabel = 'password',
  disabled,
  ...inputProps
}: PasswordInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [isVisible, setIsVisible] = useState(false);

  return <div className={containerClassName}>
    {label && <label htmlFor={inputId}>{label}</label>}
    <span className={styles.control}>
      <input {...inputProps} id={inputId} type={isVisible ? 'text' : 'password'}
        className={`${className} ${styles.input}`} disabled={disabled}
        autoCapitalize="none" autoCorrect="off" spellCheck={false} />
      <button type="button" className={styles.toggle} disabled={disabled}
        aria-label={`${isVisible ? 'Hide' : 'Show'} ${visibilityLabel}`}
        aria-controls={inputId} aria-pressed={isVisible}
        onClick={() => setIsVisible(visible => !visible)}>
        {isVisible ? 'Hide' : 'Show'}
      </button>
    </span>
  </div>;
}
