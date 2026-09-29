import { PaymentMethod, PaymentEnum } from './enums';

export interface Payment {
  paymentId: string;
  jobId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentEnum;
  paymentDate: string;
  transactionReference?: string;
}

export interface CardPaymentFormValues {
  cardholderName: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

export interface CardFormErrors {
  cardholderName?: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
}