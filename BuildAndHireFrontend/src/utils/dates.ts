export function dateInputToUtc(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Enter a valid date.');
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error('Enter a valid date.');
  }
  return date.toISOString();
}

export function jobCalendarDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-ZA', {
    timeZone: 'Africa/Johannesburg', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const part = (type: string) => parts.find(item => item.type === type)?.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function calendarDaysInclusive(start: string, end: string): number {
  try {
    const first = Date.parse(dateInputToUtc(start));
    const last = Date.parse(dateInputToUtc(end));
    return Math.max(0, Math.round((last - first) / 86400000) + 1);
  } catch {
    return 0;
  }
}

export function daysWorking(job: { status: string; startDate?: string; daysWorking?: number }, today: string): number {
  if (job.status === 'completed' || job.status === 'cancelled') return Math.max(0, job.daysWorking ?? 0);
  if (job.status !== 'accepted' && job.status !== 'in-progress') return 0;
  return calendarDaysInclusive(job.startDate?.slice(0, 10) ?? '', today);
}
