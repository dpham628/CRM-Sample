export const reps = [
  { id: 'rep-1', name: 'Alex Rivera' },
  { id: 'rep-2', name: 'Priya Patel' },
  { id: 'rep-3', name: 'Sam Chen' },
];

export const findRepById = (id) => reps.find((rep) => rep.id === id);
