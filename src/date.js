import { invitation } from './config.js';

const [Y, M, D] = invitation.date.split('-').map(Number);
const date = new Date(Y, M - 1, D);

const pad = (n) => String(n).padStart(2, '0');

export const dateParts = { day: pad(D), month: pad(M), year: String(Y) };
export const weekday = date.toLocaleDateString('en-GB', { weekday: 'long' });
export const monthName = date.toLocaleDateString('en-GB', { month: 'long' });
// e.g. "07 November 2026"
export const longDate = `${pad(D)} ${monthName} ${Y}`;

// Month grid for the calendar reveal (weeks start on Sunday).
export const calendar = {
  monthName,
  year: Y,
  day: D,
  firstWeekday: new Date(Y, M - 1, 1).getDay(),
  daysInMonth: new Date(Y, M, 0).getDate(),
  weekdays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
};
