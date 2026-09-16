const ProgressBar = ({ completed, total }) => {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="progress-block">
      <div className="progress-labels">
        <strong>
          {completed} / {total} habits completed
        </strong>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
};

export default ProgressBar;
