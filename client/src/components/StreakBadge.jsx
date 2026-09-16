import { formatStreak } from '../utils/streakUtils';

const StreakBadge = ({ label, value, accent = 'fire' }) => (
  <div className={`streak-badge ${accent}`}>
    <span>{label}</span>
    <strong>{formatStreak(value)}</strong>
  </div>
);

export default StreakBadge;
