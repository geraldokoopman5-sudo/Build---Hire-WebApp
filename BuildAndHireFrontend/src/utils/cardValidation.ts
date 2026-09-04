import type { CardPaymentFormValues, CardFormErrors } from '../types/payment';

export function formatCardNumber(value: string): string {
  const digitsOnly = value.replace(/\D/g, '').slice(0, 16);
  return digitsOnly.replace(/(.{4})/g, '$1 ').trim();
}

export function formatExpiryDate(value: string): string {
  const digitsOnly = value.replace(/\D/g, '').slice(0, 4);
  if (digitsOnly.length <= 2) return digitsOnly;
  return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`;
}

export function validateCardForm(values: CardPaymentFormValues): CardFormErrors {
  const errors: CardFormErrors = {};

  if (!values.cardholderName.trim()) {
    errors.cardholderName = 'Cardholder name is required.';
  }

  const cardDigits = values.cardNumber.replace(/\s/g, '');
  if (!cardDigits) {
    errors.cardNumber = 'Card number is required.';
  } else if (cardDigits.length !== 16) {
    errors.cardNumber = 'Card number must be 16 digits.';
  }

  if (!values.expiryDate) {
    errors.expiryDate = 'Expiry date is required.';
  } else if (!/^\d{2}\/\d{2}$/.test(values.expiryDate)) {
    errors.expiryDate = 'Use MM/YY format.';
  }

  if (!values.cvv) {
    errors.cvv = 'CVV is required.';
  } else if (!/^\d{3,4}$/.test(values.cvv)) {
    errors.cvv = 'CVV must be 3 or 4 digits.';
  }

  return errors;
}