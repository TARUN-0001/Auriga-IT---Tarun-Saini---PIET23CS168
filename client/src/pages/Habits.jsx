import { useEffect, useMemo, useState } from 'react';
import HabitForm from '../components/HabitForm';
import HabitCard from '../components/HabitCard';
import SearchBar from '../components/SearchBar';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import { archiveHabit, createHabit, fetchHabits, toggleHabitLog, updateHabit } from '../services/habitService';

const Habits = () => {
  const [habits, setHabits] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  const loadHabits = async (query = search) => {
    try {
      setLoading(true);
      const data = await fetchHabits(query);
      setHabits(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to fetch habits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHabits();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadHabits(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const handleCreateOrUpdate = async (payload) => {
    try {
      if (editingHabit) {
        await updateHabit(editingHabit.id, payload);
      } else {
        await createHabit(payload);
      }
      setShowForm(false);
      setEditingHabit(null);
      await loadHabits(search);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save habit');
    }
  };

  const handleArchive = async (habitId) => {
    try {
      await archiveHabit(habitId);
      await loadHabits(search);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to archive habit');
    }
  };

  const handleToggle = async (habitId, completed) => {
    const today = new Date().toISOString().slice(0, 10);
    try {
      await toggleHabitLog(habitId, today, completed);
      setHabits((previous) => previous.map((habit) => (
        habit.id === habitId ? { ...habit, completed } : habit
      )));
      await loadHabits(search);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update habit');
    }
  };

  const handleEdit = (habit) => {
    setEditingHabit(habit);
    setShowForm(true);
  };

  const formValues = editingHabit ? { ...editingHabit, frequencyType: editingHabit.frequencyType || editingHabit.frequency_type } : null;

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Habits</p>
          <h1>Your habits</h1>
        </div>
        <button className="primary-button" onClick={() => { setEditingHabit(null); setShowForm(true); }}>
          Add Habit
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="toolbar">
        <SearchBar value={search} onChange={setSearch} />
      </div>

      {showForm && (
        <section className="panel">
          <HabitForm
            initialValues={formValues}
            submitLabel={editingHabit ? 'Save Changes' : 'Create Habit'}
            onSubmit={handleCreateOrUpdate}
            onCancel={() => { setShowForm(false); setEditingHabit(null); }}
          />
        </section>
      )}

      {loading ? (
        <Loading label="Loading habits..." />
      ) : habits.length === 0 ? (
        <EmptyState
          title="No habits found"
          message="Try a different search or add your first habit."
        />
      ) : (
        <div className="habit-grid">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggle={handleToggle}
              onEdit={handleEdit}
              onArchive={handleArchive}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Habits;
