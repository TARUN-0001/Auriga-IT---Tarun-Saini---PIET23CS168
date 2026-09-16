import { useEffect, useMemo, useState } from 'react';
import HabitCard from '../components/HabitCard';
import Loading from '../components/Loading';
import ProgressBar from '../components/ProgressBar';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { fetchTodayHabits, toggleHabitLog } from '../services/habitService';
import { getTodayDate } from '../utils/dateUtils';

const Dashboard = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notificationState, setNotificationState] = useState(
    typeof Notification === 'undefined' ? 'unsupported' : Notification.permission
  );
  const [bulkUpdating, setBulkUpdating] = useState(false);

  const loadHabits = async () => {
    try {
      setLoading(true);
      const data = await fetchTodayHabits();
      setHabits(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load dashboard habits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHabits();
  }, []);

  const completedCount = useMemo(
    () => habits.filter((habit) => habit.completed).length,
    [habits]
  );
  const pendingHabits = useMemo(
    () => habits.filter((habit) => !habit.completed),
    [habits]
  );
  const completionPercent = habits.length === 0 ? 0 : Math.round((completedCount / habits.length) * 100);

  useEffect(() => {
    if (loading || pendingHabits.length === 0 || notificationState !== 'granted') {
      return;
    }

    const reminderKey = `habit_tracker_reminder_${new Date().toISOString().slice(0, 10)}`;
    if (!localStorage.getItem(reminderKey)) {
      new Notification(`You still have ${pendingHabits.length} habit${pendingHabits.length === 1 ? '' : 's'} to log`, {
        body: pendingHabits.map((habit) => habit.name).join(', '),
        tag: 'habit-tracker-morning-reminder',
      });
      localStorage.setItem(reminderKey, 'sent');
    }
  }, [loading, notificationState, pendingHabits]);

  const handleToggle = async (habitId, completed) => {
    try {
      const today = new Date();
      const isoDate = today.toISOString().split('T')[0];
      await toggleHabitLog(habitId, isoDate, completed);
      setHabits((previous) => previous.map((habit) => (
        habit.id === habitId ? { ...habit, completed } : habit
      )));
      await loadHabits();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update habit progress');
    }
  };

  const handleCompleteAll = async () => {
    try {
      setBulkUpdating(true);
      const today = new Date().toISOString().slice(0, 10);
      await Promise.all(pendingHabits.map((habit) => toggleHabitLog(habit.id, today, true)));
      await loadHabits();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update all habits');
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleEnableNotifications = async () => {
    if (typeof Notification === 'undefined') {
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationState(permission);
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">75-day challenge</p>
          <h1>Good morning, {user?.name || 'friend'}</h1>
          <p className="page-subtitle">Keep today simple: show up, tick one off, then the next.</p>
        </div>
        <span className="date-badge">{getTodayDate()}</span>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <section className="challenge-panel">
        <div className="challenge-copy">
          <span className="challenge-kicker">Today's momentum</span>
          <strong>{completedCount === habits.length && habits.length > 0 ? 'You kept the promise today.' : `${pendingHabits.length} to go`}</strong>
          <span>{completionPercent}% of today's scheduled habits complete</span>
        </div>
        <ProgressBar completed={completedCount} total={habits.length} />
        {pendingHabits.length > 0 && (
          <div className="challenge-actions">
            <button className="primary-button" onClick={handleCompleteAll} disabled={bulkUpdating}>
              {bulkUpdating ? 'Saving...' : 'Complete all remaining'}
            </button>
            {notificationState === 'default' && (
              <button className="ghost-button" onClick={handleEnableNotifications}>
                Enable morning reminders
              </button>
            )}
          </div>
        )}
      </section>

      {!loading && pendingHabits.length > 0 && (
        <section className="reminder-panel" aria-live="polite">
          <div className="reminder-icon" aria-hidden="true">!</div>
          <div>
            <strong>Still waiting on you</strong>
            <p>{pendingHabits.map((habit) => habit.name).join(', ')} {pendingHabits.length === 1 ? 'is' : 'are'} not logged yet today.</p>
          </div>
        </section>
      )}

      {loading ? (
        <Loading label="Loading today's habits..." />
      ) : habits.length === 0 ? (
        <EmptyState
          title="No habits scheduled today"
          message="Create a habit or come back tomorrow."
        />
      ) : (
        <div className="habit-grid">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggle={handleToggle}
              onEdit={null}
              onArchive={null}
              showArchiveButton={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
