import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Calendar from '../components/Calendar';
import Loading from '../components/Loading';
import StreakBadge from '../components/StreakBadge';
import { getHabitById, getHabitLogs } from '../services/habitService';
import { getHabitScheduleLabel } from '../utils/streakUtils';

const HabitDetails = () => {
  const { id } = useParams();
  const [habit, setHabit] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHabit = async () => {
      try {
        setLoading(true);
        const [habitData, logsData] = await Promise.all([
          getHabitById(id),
          getHabitLogs(id),
        ]);
        setHabit(habitData);
        setLogs(logsData);
      } finally {
        setLoading(false);
      }
    };

    loadHabit();
  }, [id]);

  if (loading) return <Loading label="Loading habit details..." />;
  if (!habit) return <h2>Habit not found</h2>;

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Habit Details</p>
          <h1>{habit.name}</h1>
        </div>
      </div>

      <div className="habit-detail-grid">
        <section className="panel">
          <h3>Overview</h3>
          <div className="streak-row">
            <StreakBadge label="Current streak" value={habit.currentStreak || 0} accent="fire" />
            <StreakBadge label="Best streak" value={habit.bestStreak || 0} accent="gold" />
          </div>
          <p><strong>Schedule:</strong> {getHabitScheduleLabel(habit)}</p>
        </section>

        <section className="panel">
          <h3>Completion calendar</h3>
          <Calendar logs={logs} habit={habit} />
        </section>
      </div>
    </div>
  );
};

export default HabitDetails;
