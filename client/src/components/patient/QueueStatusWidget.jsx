const QueueStatusWidget = ({ queue }) => {
  if (!queue) {
    return <div className="rounded-2xl bg-white p-5 shadow-card">No active queue selected.</div>;
  }

  return (
    <div className="rounded-2xl border border-teal-100 bg-white p-5 shadow-card">
      <p className="text-sm font-medium text-teal-700">Live Queue Status</p>

      <div className="mt-3 rounded-xl border border-teal-100 bg-teal-50/40 p-3">
        <div className="flex items-center gap-3">
          {queue.doctorPhoto ? (
            <img src={queue.doctorPhoto} alt={`Dr. ${queue.doctorName || 'Doctor'}`} className="h-12 w-12 rounded-full object-cover" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 font-semibold text-teal-700">
              {(queue.doctorName || 'D').charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold text-ink">Dr. {queue.doctorName || 'Doctor'}</p>
            <p className="text-sm text-teal-700">{queue.specialization || 'General Medicine'}</p>
          </div>
        </div>
        <div className="mt-3 grid gap-1 text-sm text-teal-900 md:grid-cols-2">
          <p><span className="font-medium">Hospital:</span> {queue.hospitalName || '-'}</p>
          <p><span className="font-medium">Date:</span> {queue.date || '-'}</p>
          <p><span className="font-medium">Time Slot:</span> {queue.timeSlot || '-'}</p>
          <p><span className="font-medium">Appointment Status:</span> {queue.appointmentStatus || '-'}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm text-teal-900 sm:grid-cols-4">
        <p className="rounded-lg border border-teal-100 bg-white p-2">Your Token: <strong>#{queue.tokenNumber || '-'}</strong></p>
        <p className="rounded-lg border border-teal-100 bg-white p-2">Current Token: <strong>{queue.currentToken || 0}</strong></p>
        <p className="rounded-lg border border-teal-100 bg-white p-2">Queue Position: <strong>{queue.queuePosition || 0}</strong></p>
        <p className="rounded-lg border border-teal-100 bg-white p-2">Est. Wait: <strong>{queue.estimatedWaitTime || 0} min</strong></p>
      </div>
    </div>
  );
};

export default QueueStatusWidget;
