import { Link } from 'react-router-dom';
import StreakBadge from './StreakBadge';
import { getHabitScheduleLabel } from '../utils/streakUtils';

const HabitCard = ({ habit, onToggle, onEdit, onArchive, showArchiveButton = true }) => {
  const handleToggle = () => onToggle(habit.id, !habit.completed);

  return (
    <article className="habit-card">
      <div className="habit-card-header">
        <div>
          <h3>{habit.name}</h3>
          <small>{getHabitScheduleLabel(habit)}</small>
        </div>
        {showArchiveButton && (
          <button className="ghost-button" onClick={() => onArchive(habit.id)}>
            Archive
          </button>
        )}
      </div>

      <div className="habit-card-main">
        <label className="check-row">
          <input
            type="checkbox"
            checked={Boolean(habit.completed)}
            onChange={handleToggle}
          />
          <span>{habit.completed ? 'Completed today' : 'Mark complete'}</span>
        </label>
      </div>

      <div className="habit-card-stats">
        <StreakBadge label="Current streak" value={habit.currentStreak || 0} accent="fire" />
        <StreakBadge label="Best streak" value={habit.bestStreak || 0} accent="gold" />
      </div>

      <div className="card-actions">
        <Link className="secondary-button" to={`/habits/${habit.id}`}>
          Details
        </Link>
        {onEdit && (
          <button className="secondary-button" onClick={() => onEdit(habit)}>
            Edit
          </button>
        )}
      </div>
    </article>
  );
};

export default HabitCard;
