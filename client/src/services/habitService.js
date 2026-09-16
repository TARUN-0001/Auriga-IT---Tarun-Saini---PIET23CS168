import api from './api';

export const fetchTodayHabits = async () => {
  const response = await api.get('/habits/today');
  return response.data;
};

export const fetchHabits = async (search = '') => {
  const response = await api.get('/habits', { params: { search } });
  return response.data;
};

export const fetchArchivedHabits = async () => {
  const response = await api.get('/habits/archived');
  return response.data;
};

export const createHabit = async (payload) => {
  const response = await api.post('/habits', payload);
  return response.data;
};

export const updateHabit = async (habitId, payload) => {
  const response = await api.put(`/habits/${habitId}`, payload);
  return response.data;
};

export const archiveHabit = async (habitId) => {
  const response = await api.patch(`/habits/${habitId}/archive`);
  return response.data;
};

export const restoreHabit = async (habitId) => {
  const response = await api.patch(`/habits/${habitId}/restore`);
  return response.data;
};

export const getHabitById = async (habitId) => {
  const response = await api.get(`/habits/${habitId}`);
  return response.data;
};

export const getHabitLogs = async (habitId) => {
  const response = await api.get(`/habits/${habitId}/logs`);
  return response.data;
};

export const getHabitStreak = async (habitId) => {
  const response = await api.get(`/habits/${habitId}/streak`);
  return response.data;
};

export const toggleHabitLog = async (habitId, date, completed) => {
  const response = await api.post(`/habits/${habitId}/log`, { date, completed });
  return response.data;
};
