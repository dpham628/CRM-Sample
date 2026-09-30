import { addHours, isFriday, nextFriday, setHours, startOfHour } from 'date-fns';

export const DUE_OPTIONS = {
  '24h': 'Within 24 hours',
  friday: 'By Friday (5 PM)',
  custom: 'Pick a date',
};

const endOfDay = 17;

export const resolveDueDate = (option, customDate, now = new Date()) => {
  if (option === '24h') return addHours(now, 24);
  if (option === 'friday') {
    const friday = isFriday(now) && now.getHours() < endOfDay ? now : nextFriday(now);
    return startOfHour(setHours(friday, endOfDay));
  }
  if (!customDate) return null;
  const [year, month, day] = customDate.split('-').map(Number);
  return new Date(year, month - 1, day, endOfDay);
};
