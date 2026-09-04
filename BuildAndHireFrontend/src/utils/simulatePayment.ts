export function generateFakeTransactionReference(): string {
  const randomSegment = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `SIM-${randomSegment}`;
}

export function simulatePaymentDelay(): Promise<void> {
  const randomDelayMs = 1200 + Math.random() * 800;
  return new Promise((resolve) => setTimeout(resolve, randomDelayMs));
}