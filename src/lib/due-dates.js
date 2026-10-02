import { addDays, addHours, isFriday, nextFriday, nextMonday, setHours, startOfHour } from 'date-fns';

export const DUE_OPTIONS = {
  '24h': 'Within 24 hours',
  tomorrow: 'Tomorrow (5 PM)',
  friday: 'By Friday (5 PM)',
  monday: 'Next Monday (5 PM)',
  custom: 'Pick a date',
};

const endOfDay = 17;

export const resolveDueDate = (option, customDate, now = new Date()) => {
  if (option === '24h') return addHours(now, 24);
  if (option === 'tomorrow') return startOfHour(setHours(addDays(now, 1), endOfDay));
  if (option === 'friday') {
    const friday = isFriday(now) && now.getHours() < endOfDay ? now : nextFriday(now);
    return startOfHour(setHours(friday, endOfDay));
  }
  if (option === 'monday') {
    const monday = now.getDay() === 1 && now.getHours() < endOfDay ? now : nextMonday(now);
    return startOfHour(setHours(monday, endOfDay));
  }
  if (!customDate) return null;
  const [year, month, day] = customDate.split('-').map(Number);
  return new Date(year, month - 1, day, endOfDay);
};
