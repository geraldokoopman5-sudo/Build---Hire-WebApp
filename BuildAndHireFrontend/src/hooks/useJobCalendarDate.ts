import { useEffect, useState } from 'react';
import { jobCalendarDate } from '../utils/dates';

export function useJobCalendarDate() {
  const [today, setToday] = useState(() => jobCalendarDate());
  useEffect(() => {
    let timer: number;
    function schedule() {
      window.clearTimeout(timer);
      const nextMidnight = Date.parse(`${jobCalendarDate()}T00:00:00+02:00`) + 86400000;
      timer = window.setTimeout(update, Math.max(1, nextMidnight - Date.now() + 50));
    }
    function update() {
      setToday(jobCalendarDate());
      schedule();
    }
    schedule();
    window.addEventListener('focus', update);
    document.addEventListener('visibilitychange', update);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('focus', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);
  return today;
}
