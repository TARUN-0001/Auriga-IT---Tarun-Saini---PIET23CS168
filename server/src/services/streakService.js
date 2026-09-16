const getScheduledDays = (habit) => {
  if (habit.frequency_type === 'daily') {
    return Array.from({ length: 7 }, (_, index) => index);
  }

  if (habit.frequency_type === 'weekly') {
    const days = habit.days || [];
    return [...new Set(days.map(Number))].sort((a, b) => a - b);
  }

  return [];
};

const getDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getPreviousScheduledDate = (currentDate, scheduledDays) => {
  const currentDay = currentDate.getDay();
  const scheduledSet = new Set(scheduledDays);

  let date = new Date(currentDate);
  while (true) {
    date.setDate(date.getDate() - 1);
    const dayOfWeek = date.getDay();
    if (scheduledSet.has(dayOfWeek)) {
      return date;
    }
  }
};

const buildDateRange = (startDate, endDate) => {
  const dates = [];
  const cursor = new Date(startDate);
  while (cursor <= endDate) {
    dates.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
};

const getCurrentStreak = (habit, logsMap) => {
  const scheduledDays = getScheduledDays(habit);
  if (!scheduledDays.length) {
    return 0;
  }

  const today = new Date();
  const todayDay = today.getDay();

  let cursor = new Date(today);
  let hasAnyScheduledDay = scheduledDays.includes(todayDay);

  if (!hasAnyScheduledDay) {
    cursor = getPreviousScheduledDate(today, scheduledDays);
  }

  let streak = 0;
  let fallbackDate = new Date(cursor);

  while (true) {
    const key = getDateString(fallbackDate);
    const isScheduled = scheduledDays.includes(fallbackDate.getDay());
    if (!isScheduled) {
      fallbackDate = getPreviousScheduledDate(fallbackDate, scheduledDays);
      continue;
    }

    if (logsMap.get(key) === true) {
      streak += 1;
      fallbackDate = getPreviousScheduledDate(fallbackDate, scheduledDays);
      continue;
    }

    break;
  }

  return streak;
};

const getBestStreak = (habit, logsMap) => {
  const scheduledDays = getScheduledDays(habit);
  if (!scheduledDays.length) {
    return 0;
  }

  const endDate = new Date();
  const createdAt = habit.created_at ? new Date(habit.created_at) : new Date();

  const startDate = new Date(createdAt);
  const allDates = buildDateRange(startDate, endDate);

  let best = 0;
  let current = 0;

  for (const date of allDates) {
    const dayOfWeek = date.getDay();
    const isScheduled = scheduledDays.includes(dayOfWeek);

    if (!isScheduled) {
      continue;
    }

    const key = getDateString(date);
    if (logsMap.get(key) === true) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  }

  return best;
};

module.exports = {
  getCurrentStreak,
  getBestStreak,
  getScheduledDays,
};
