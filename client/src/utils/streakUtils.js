export const formatStreak = (count) => `${count} day${count === 1 ? '' : 's'}`;

export const getHabitScheduleLabel = (habit) => {
  if (!habit || !habit.frequencyType) return 'Unscheduled';
  if (habit.frequencyType === 'daily') return 'Every day';

  const ordered = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const days = (habit.days || []).slice().sort((a, b) => a - b);
  return days.map((day) => ordered[day]).join(', ') || 'No days selected';
};
