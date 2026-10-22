import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
let calendar;
try {
  calendar = await server.ssrLoadModule('/src/utils/dates.ts');
} finally {
  await server.close();
}

test('calendar rejects impossible dates and includes both endpoints', () => {
  assert.throws(() => calendar.dateInputToUtc('2027-02-31'), /valid date/);
  assert.equal(calendar.calendarDaysInclusive('2026-10-22', '2026-10-22'), 1);
  assert.equal(calendar.calendarDaysInclusive('2028-02-28', '2028-03-01'), 3);
  assert.equal(calendar.calendarDaysInclusive('2026-10-23', '2026-10-26'), 4);
  assert.equal(calendar.calendarDaysInclusive('2026-10-26', '2026-10-23'), 0);
  assert.equal(calendar.calendarDaysInclusive('', ''), 0);
});

test('day count uses the start date rather than submission or acceptance', () => {
  const job = { status: 'accepted', startDate: '2026-10-23T00:00:00Z', daysWorking: 999 };
  assert.equal(calendar.daysWorking(job, '2026-10-22'), 0);
  assert.equal(calendar.daysWorking(job, '2026-10-23'), 1);
  assert.equal(calendar.daysWorking(job, '2026-10-26'), 4);
  assert.equal(calendar.daysWorking({ ...job, status: 'in-progress' }, '2026-10-26'), 4);
  assert.equal(calendar.daysWorking({ ...job, status: 'requested' }, '2026-10-26'), 0);
  assert.equal(calendar.daysWorking({ ...job, status: 'rejected' }, '2026-10-26'), 0);
});

test('completed and cancelled jobs keep the final count', () => {
  for (const status of ['completed', 'cancelled']) {
    assert.equal(calendar.daysWorking({ status, startDate: '2026-10-23', daysWorking: 4 }, '2027-10-26'), 4);
  }
});

test('calendar changes day at South African midnight', () => {
  assert.equal(calendar.jobCalendarDate(new Date('2026-10-21T21:59:59Z')), '2026-10-21');
  assert.equal(calendar.jobCalendarDate(new Date('2026-10-21T22:00:00Z')), '2026-10-22');
});
