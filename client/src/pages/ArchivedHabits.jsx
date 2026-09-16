import { useEffect, useState } from 'react';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';
import { fetchArchivedHabits, restoreHabit } from '../services/habitService';

const ArchivedHabits = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadHabits = async () => {
    try {
      setLoading(true);
      const data = await fetchArchivedHabits();
      setHabits(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHabits();
  }, []);

  const handleRestore = async (habitId) => {
    await restoreHabit(habitId);
    loadHabits();
  };

  if (loading) return <Loading label="Loading archived habits..." />;

  if (habits.length === 0) {
    return (
      <div className="page-shell">
        <EmptyState title="No archived habits" message="Archived habits will appear here once you hide one." />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Archive</p>
          <h1>Archived habits</h1>
        </div>
      </div>

      <div className="habit-grid">
        {habits.map((habit) => (
          <article key={habit.id} className="habit-card archived-card">
            <div className="habit-card-header">
              <div>
                <h3>{habit.name}</h3>
                <small>Archived</small>
              </div>
            </div>
            <button className="primary-button" onClick={() => handleRestore(habit.id)}>
              Restore
            </button>
          </article>
        ))}
      </div>
    </div>
  );
};

export default ArchivedHabits;
