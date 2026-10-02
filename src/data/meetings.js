import { addHours } from 'date-fns';

const meetings = [
  { id: 'm1', contactId: '1', title: 'Contract review', startsInHours: 26, durationMin: 30 },
  { id: 'm2', contactId: '2', title: 'Renewal planning', startsInHours: 3, durationMin: 45 },
  { id: 'm3', contactId: '3', title: 'Discovery follow-up', startsInHours: -20, durationMin: 30 },
];

export const getMeetings = (now = new Date()) =>
  meetings
    .map(({ startsInHours, ...meeting }) => ({
      ...meeting,
      startAt: addHours(now, startsInHours).toISOString(),
    }))
    .sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
