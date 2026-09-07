export function generateApplicationReference(): string {
  const digits = Math.floor(1000 + Math.random() * 9000);
  const letters = Array.from({ length: 2 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26))
  ).join('');

  return `REF-${digits}-${letters}`;
}