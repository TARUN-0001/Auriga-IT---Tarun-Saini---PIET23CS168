const EmptyState = ({ title, message, action }) => (
  <div className="empty-state">
    <h3>{title}</h3>
    <p>{message}</p>
    {action}
  </div>
);

export default EmptyState;
