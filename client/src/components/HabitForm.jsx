import { useEffect, useState } from 'react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const HabitForm = ({ initialValues = null, onSubmit, onCancel, submitLabel = 'Save Habit' }) => {
  const [form, setForm] = useState({
    name: '',
    frequencyType: 'daily',
    days: [],
  });

  useEffect(() => {
    if (initialValues) {
      setForm({
        name: initialValues.name || '',
        frequencyType: initialValues.frequencyType || 'daily',
        days: initialValues.days || [],
      });
    }
  }, [initialValues]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const toggleDay = (dayNumber) => {
    setForm((previous) => {
      const nextDays = previous.days.includes(dayNumber)
        ? previous.days.filter((value) => value !== dayNumber)
        : [...previous.days, dayNumber].sort((a, b) => a - b);

      return { ...previous, days: nextDays };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      name: form.name.trim(),
      frequencyType: form.frequencyType,
      days: form.frequencyType === 'weekly' ? form.days : [0, 1, 2, 3, 4, 5, 6],
    });
  };

  return (
    <form className="habit-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="habit-name">Habit Name</label>
        <input
          id="habit-name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          placeholder="e.g. Morning Walk"
          required
        />
      </div>

      <div className="form-group">
        <label>Frequency</label>
        <div className="radio-row">
          <label>
            <input
              type="radio"
              name="frequencyType"
              value="daily"
              checked={form.frequencyType === 'daily'}
              onChange={handleChange}
            />
            Every day
          </label>
          <label>
            <input
              type="radio"
              name="frequencyType"
              value="weekly"
              checked={form.frequencyType === 'weekly'}
              onChange={handleChange}
            />
            Specific days
          </label>
        </div>
      </div>

      {form.frequencyType === 'weekly' && (
        <div className="form-group">
          <label>Schedule</label>
          <div className="day-grid">
            {DAYS.map((day, index) => (
              <button
                type="button"
                key={day}
                className={`day-chip ${form.days.includes(index) ? 'selected' : ''}`}
                onClick={() => toggleDay(index)}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="secondary-button" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="primary-button">
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export default HabitForm;
