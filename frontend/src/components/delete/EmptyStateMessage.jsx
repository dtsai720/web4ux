
const EmptyStateMessage = ({ message }) => {
  return (
    <div className="text-center py-4">
      <i className="bi bi-check-circle fs-1 text-success"></i>
      <p className="text-center text-muted mt-3">{message}</p>
    </div>
  );
};

export default EmptyStateMessage;
