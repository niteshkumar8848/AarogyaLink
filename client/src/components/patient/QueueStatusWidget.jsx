const QueueStatusWidget = ({ queue }) => {
  if (!queue) {
    return <div className="rounded-2xl bg-white p-5 shadow-card">No active queue selected.</div>;
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-card">
      <p className="text-sm text-teal-600">Live Queue Status</p>
      <p className="mt-2 text-4xl font-bold text-primary">#{queue.tokenNumber || '-'}</p>
      <div className="mt-4 grid gap-2 text-sm text-teal-800 sm:grid-cols-3">
        <p>Current token: <strong>{queue.currentToken || 0}</strong></p>
        <p>Queue position: <strong>{queue.queuePosition || 0}</strong></p>
        <p>Est. wait: <strong>{queue.estimatedWaitTime || 0} min</strong></p>
      </div>
    </div>
  );
};

export default QueueStatusWidget;
