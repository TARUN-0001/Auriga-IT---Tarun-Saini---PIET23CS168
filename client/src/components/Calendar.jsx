import { getDateKey, getThisMonthDates } from '../utils/dateUtils';

const Calendar = ({ logs = [], habit }) => {
  const monthDays = getThisMonthDates();
  const completedDates = new Set(
    logs.filter((log) => log.completed).map((log) => log.log_date)
  );

  const scheduleDays = (habit?.days || []).map(Number);

  return (
    <div className="calendar-grid">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
        <div key={day} className="calendar-header-cell">
          {day}
        </div>
      ))}

      {monthDays.map((date) => {
        const dateKey = getDateKey(date);
        const isCompleted = completedDates.has(dateKey);
        const matchesSchedule = habit && habit.frequencyType === 'weekly' ? scheduleDays.includes(date.getDay()) : true;

        return (
          <div
            key={dateKey}
            className={`calendar-day ${isCompleted ? 'completed' : ''} ${!matchesSchedule ? 'off-schedule' : ''}`}
          >
            {date.getDate()}
          </div>
        );
      })}
    </div>
  );
};

export default Calendar;
