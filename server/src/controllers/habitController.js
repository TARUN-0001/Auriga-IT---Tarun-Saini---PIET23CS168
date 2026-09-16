const pool = require('../config/db');
const { getCurrentStreak, getBestStreak, getScheduledDays } = require('../services/streakService');

const normalizeDays = (days) => {
  if (!Array.isArray(days)) {
    return [];
  }

  const uniqueDays = [...new Set(days.map((day) => Number(day)).filter((day) => day >= 0 && day <= 6))];
  return uniqueDays.sort((a, b) => a - b);
};

const normalizeLogDate = (date) => new Date(date).toISOString().slice(0, 10);

const getHabitWithStats = async (habit, userId) => {
  const logsResult = await pool.query(
    'SELECT log_date, completed FROM habit_logs WHERE habit_id = $1 AND habit_id IN (SELECT id FROM habits WHERE user_id = $2)',
    [habit.id, userId]
  );

  const logMap = new Map();
  logsResult.rows.forEach((row) => {
    logMap.set(normalizeLogDate(row.log_date), row.completed === true || row.completed === 'true');
  });

  const scheduledDays = getScheduledDays(habit);
  const completed = logMap.get(new Date().toISOString().slice(0, 10)) === true;

  return {
    ...habit,
    days: scheduledDays,
    completed,
    currentStreak: getCurrentStreak(habit, logMap),
    bestStreak: getBestStreak(habit, logMap),
  };
};

const createHabit = async (req, res, next) => {
  try {
    const { name, frequencyType, days } = req.body;

    if (!name || !frequencyType) {
      return res.status(400).json({ message: 'Habit name and frequency type are required' });
    }

    const frequency = String(frequencyType).toLowerCase();
    if (!['daily', 'weekly'].includes(frequency)) {
      return res.status(400).json({ message: 'Frequency type must be daily or weekly' });
    }

    const trimmedName = String(name).trim();
    if (!trimmedName) {
      return res.status(400).json({ message: 'Habit name cannot be empty' });
    }

    const cleanedDays = normalizeDays(days);

    if (frequency === 'weekly' && cleanedDays.length === 0) {
      return res.status(400).json({ message: 'Select at least one weekday for weekly habits' });
    }

    const result = await pool.query(
      'INSERT INTO habits (user_id, name, frequency_type, archived) VALUES ($1, $2, $3, false) RETURNING *',
      [req.user.id, trimmedName, frequency]
    );

    const habit = result.rows[0];

    if (frequency === 'daily') {
      const dailyDays = [0, 1, 2, 3, 4, 5, 6];
      for (const day of dailyDays) {
        await pool.query(
          'INSERT INTO habit_schedules (habit_id, day_of_week) VALUES ($1, $2) ON CONFLICT (habit_id, day_of_week) DO NOTHING',
          [habit.id, day]
        );
      }
    } else {
      for (const day of cleanedDays) {
        await pool.query(
          'INSERT INTO habit_schedules (habit_id, day_of_week) VALUES ($1, $2) ON CONFLICT (habit_id, day_of_week) DO NOTHING',
          [habit.id, day]
        );
      }
    }

    const detailedHabit = await getHabitDetailsById(habit.id, req.user.id);
    return res.status(201).json(detailedHabit);
  } catch (error) {
    next(error);
  }
};

const getHabitDetailsById = async (habitId, userId) => {
  const habitResult = await pool.query(
    'SELECT h.*, ARRAY(SELECT hs.day_of_week FROM habit_schedules hs WHERE hs.habit_id = h.id ORDER BY hs.day_of_week) AS days FROM habits h WHERE h.id = $1 AND h.user_id = $2',
    [habitId, userId]
  );

  if (habitResult.rows.length === 0) {
    return null;
  }

  const habit = habitResult.rows[0];
  const logMap = new Map();
  const logsResult = await pool.query('SELECT log_date, completed FROM habit_logs WHERE habit_id = $1', [habitId]);
  logsResult.rows.forEach((row) => {
    logMap.set(normalizeLogDate(row.log_date), row.completed);
  });

  const habitDays = Array.isArray(habit.days) ? habit.days.map(Number) : [];

  return {
    ...habit,
    days: habitDays,
    frequencyType: habit.frequency_type,
    currentStreak: getCurrentStreak({ ...habit, days: habitDays, frequency_type: habit.frequency_type }, logMap),
    bestStreak: getBestStreak({ ...habit, days: habitDays, frequency_type: habit.frequency_type }, logMap),
  };
};

const getAllHabits = async (req, res, next) => {
  try {
    const { search = '' } = req.query;
    const query = `
      SELECT h.*, ARRAY(SELECT hs.day_of_week FROM habit_schedules hs WHERE hs.habit_id = h.id ORDER BY hs.day_of_week) AS days
      FROM habits h
      WHERE h.user_id = $1 AND h.archived = false
      ${search ? 'AND h.name ILIKE $2' : ''}
      ORDER BY h.created_at DESC
    `;

    const values = [req.user.id];
    if (search) {
      values.push(`%${search}%`);
    }

    const result = await pool.query(query, values);

    const habits = await Promise.all(result.rows.map(async (habit) => {
      const logsResult = await pool.query('SELECT log_date, completed FROM habit_logs WHERE habit_id = $1', [habit.id]);
      const logMap = new Map();
      logsResult.rows.forEach((row) => {
        logMap.set(normalizeLogDate(row.log_date), row.completed);
      });

      const days = Array.isArray(habit.days) ? habit.days.map(Number) : [];
      const scheduledDays = days.length ? days : getScheduledDays({ ...habit, frequency_type: habit.frequency_type, days });
      const todayKey = new Date().toISOString().slice(0, 10);

      return {
        ...habit,
        days: scheduledDays,
        frequencyType: habit.frequency_type,
        completed: logMap.get(todayKey) === true,
        currentStreak: getCurrentStreak({ ...habit, days: scheduledDays, frequency_type: habit.frequency_type }, logMap),
        bestStreak: getBestStreak({ ...habit, days: scheduledDays, frequency_type: habit.frequency_type }, logMap),
      };
    }));

    return res.json(habits);
  } catch (error) {
    next(error);
  }
};

const getTodayHabits = async (req, res, next) => {
  try {
    const today = new Date();
    const weekday = today.getDay();

    const result = await pool.query(
      `SELECT h.*, ARRAY(SELECT hs.day_of_week FROM habit_schedules hs WHERE hs.habit_id = h.id ORDER BY hs.day_of_week) AS days
       FROM habits h
       WHERE h.user_id = $1 AND h.archived = false
       ORDER BY h.created_at DESC`,
      [req.user.id]
    );

    const habits = await Promise.all(result.rows.map(async (habit) => {
      const days = Array.isArray(habit.days) ? habit.days.map(Number) : [];
      const scheduledDays = days.length ? days : getScheduledDays({ ...habit, frequency_type: habit.frequency_type, days });
      const currentDay = weekday;
      const isScheduled = scheduledDays.includes(currentDay);

      if (!isScheduled) {
        return null;
      }

      const logsResult = await pool.query('SELECT log_date, completed FROM habit_logs WHERE habit_id = $1', [habit.id]);
      const logMap = new Map();
      logsResult.rows.forEach((row) => {
        logMap.set(normalizeLogDate(row.log_date), row.completed);
      });

      const todayKey = new Date().toISOString().slice(0, 10);
      const complete = logMap.get(todayKey) === true;

      return {
        ...habit,
        id: habit.id,
        name: habit.name,
        days: scheduledDays,
        frequencyType: habit.frequency_type,
        completed: complete,
        currentStreak: getCurrentStreak({ ...habit, days: scheduledDays, frequency_type: habit.frequency_type }, logMap),
        bestStreak: getBestStreak({ ...habit, days: scheduledDays, frequency_type: habit.frequency_type }, logMap),
      };
    }));

    return res.json(habits.filter(Boolean));
  } catch (error) {
    next(error);
  }
};

const getHabitById = async (req, res, next) => {
  try {
    const habit = await getHabitDetailsById(req.params.id, req.user.id);
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }
    return res.json(habit);
  } catch (error) {
    next(error);
  }
};

const updateHabit = async (req, res, next) => {
  try {
    const { name, frequencyType, days } = req.body;
    const habitId = Number(req.params.id);

    if (!habitId) {
      return res.status(400).json({ message: 'Habit id is required' });
    }

    const existing = await pool.query('SELECT id FROM habits WHERE id = $1 AND user_id = $2', [habitId, req.user.id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const trimmedName = String(name || '').trim();
    if (!trimmedName) {
      return res.status(400).json({ message: 'Habit name is required' });
    }

    const frequency = String(frequencyType || '').toLowerCase();
    if (!['daily', 'weekly'].includes(frequency)) {
      return res.status(400).json({ message: 'Frequency type must be daily or weekly' });
    }

    const cleanedDays = normalizeDays(days);
    if (frequency === 'weekly' && cleanedDays.length === 0) {
      return res.status(400).json({ message: 'Select at least one weekday for weekly habits' });
    }

    await pool.query(
      'UPDATE habits SET name = $1, frequency_type = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND user_id = $4',
      [trimmedName, frequency, habitId, req.user.id]
    );

    await pool.query('DELETE FROM habit_schedules WHERE habit_id = $1', [habitId]);

    const selectedDays = frequency === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : cleanedDays;
    for (const day of selectedDays) {
      await pool.query(
        'INSERT INTO habit_schedules (habit_id, day_of_week) VALUES ($1, $2)',
        [habitId, day]
      );
    }

    const updated = await getHabitDetailsById(habitId, req.user.id);
    return res.json(updated);
  } catch (error) {
    next(error);
  }
};

const archiveHabit = async (req, res, next) => {
  try {
    const habitId = Number(req.params.id);
    const result = await pool.query(
      'UPDATE habits SET archived = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 RETURNING *',
      [habitId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    return res.json({ message: 'Habit archived successfully', habit: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

const restoreHabit = async (req, res, next) => {
  try {
    const habitId = Number(req.params.id);
    const result = await pool.query(
      'UPDATE habits SET archived = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 RETURNING *',
      [habitId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    return res.json({ message: 'Habit restored successfully', habit: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

const getArchivedHabits = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT h.*, ARRAY(SELECT hs.day_of_week FROM habit_schedules hs WHERE hs.habit_id = h.id ORDER BY hs.day_of_week) AS days
       FROM habits h
       WHERE h.user_id = $1 AND h.archived = true
       ORDER BY h.updated_at DESC`,
      [req.user.id]
    );

    return res.json(result.rows.map((habit) => ({
      ...habit,
      days: Array.isArray(habit.days) ? habit.days.map(Number) : [],
      frequencyType: habit.frequency_type,
    })));
  } catch (error) {
    next(error);
  }
};

const logHabit = async (req, res, next) => {
  try {
    const { date, completed } = req.body;
    const habitId = Number(req.params.id);

    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const habitExists = await pool.query('SELECT id FROM habits WHERE id = $1 AND user_id = $2', [habitId, req.user.id]);
    if (habitExists.rows.length === 0) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const completedValue = Boolean(completed);

    await pool.query(
      `INSERT INTO habit_logs (habit_id, log_date, completed)
       VALUES ($1, $2, $3)
       ON CONFLICT (habit_id, log_date)
       DO UPDATE SET completed = EXCLUDED.completed`,
      [habitId, date, completedValue]
    );

    const latest = await pool.query(
      'SELECT * FROM habit_logs WHERE habit_id = $1 AND log_date = $2',
      [habitId, date]
    );

    return res.status(200).json({ message: 'Habit log updated', log: latest.rows[0] });
  } catch (error) {
    next(error);
  }
};

const getHabitLogs = async (req, res, next) => {
  try {
    const habitId = Number(req.params.id);
    const result = await pool.query(
      'SELECT * FROM habit_logs WHERE habit_id = $1 AND habit_id IN (SELECT id FROM habits WHERE user_id = $2) ORDER BY log_date ASC',
      [habitId, req.user.id]
    );

    return res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

const getHabitStreak = async (req, res, next) => {
  try {
    const habitId = Number(req.params.id);
    const habitResult = await pool.query(
      `SELECT h.*, ARRAY(SELECT hs.day_of_week FROM habit_schedules hs WHERE hs.habit_id = h.id ORDER BY hs.day_of_week) AS days
       FROM habits h WHERE h.id = $1 AND h.user_id = $2`,
      [habitId, req.user.id]
    );

    if (habitResult.rows.length === 0) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const habit = habitResult.rows[0];
    const logsResult = await pool.query('SELECT log_date, completed FROM habit_logs WHERE habit_id = $1', [habitId]);
    const logMap = new Map();
    logsResult.rows.forEach((row) => {
      logMap.set(normalizeLogDate(row.log_date), row.completed === true || row.completed === 'true');
    });

    const currentStreak = getCurrentStreak({ ...habit, days: Array.isArray(habit.days) ? habit.days.map(Number) : [], frequency_type: habit.frequency_type }, logMap);
    const bestStreak = getBestStreak({ ...habit, days: Array.isArray(habit.days) ? habit.days.map(Number) : [], frequency_type: habit.frequency_type }, logMap);

    return res.json({ currentStreak, bestStreak });
  } catch (error) {
    next(error);
  }
};

const deleteHabit = async (req, res, next) => {
  try {
    const habitId = Number(req.params.id);
    const result = await pool.query('DELETE FROM habits WHERE id = $1 AND user_id = $2 RETURNING *', [habitId, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    return res.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createHabit,
  getAllHabits,
  getTodayHabits,
  getHabitById,
  updateHabit,
  archiveHabit,
  restoreHabit,
  getArchivedHabits,
  logHabit,
  getHabitLogs,
  getHabitStreak,
  deleteHabit,
};
