const QueueManager = ({ queue, onCallNext, onMarkDone }) => {
  const entries = queue?.entries || [];

  return (
    <div className="rounded-2xl bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={onCallNext} className="rounded-lg bg-primary px-4 py-2 text-white">Call Next</button>
      </div>
      <div className="mt-4 space-y-2">
        {entries.length ? (
          entries.map((entry) => (
            <div key={entry.appointmentId?._id || entry.tokenNumber} className="flex items-start justify-between gap-3 rounded-lg border border-teal-100 p-3">
              <div>
                <p className="text-sm">
                  Token <strong>#{entry.tokenNumber}</strong> · {entry.status}
                </p>
                <p className="text-xs text-slate-700">
                  Notes: {entry.appointmentId?.notes || 'No notes provided by patient.'}
                </p>
              </div>
              <button
                onClick={() => onMarkDone(entry.appointmentId?._id || entry.appointmentId)}
                className="rounded-lg bg-teal-600 px-3 py-1 text-xs text-white"
              >
                Mark Done
              </button>
            </div>
          ))
        ) : (
          <p className="text-sm text-teal-700">No entries in queue.</p>
        )}
      </div>
    </div>
  );
};

export default QueueManager;
