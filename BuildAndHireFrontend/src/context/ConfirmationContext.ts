import { createContext } from 'react';

export interface ConfirmationOptions {
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export type RequestConfirmation = (message: string, options?: ConfirmationOptions) => Promise<boolean>;

export const ConfirmationContext = createContext<RequestConfirmation | null>(null);
