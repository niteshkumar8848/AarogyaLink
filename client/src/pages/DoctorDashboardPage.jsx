import { useEffect, useState } from 'react';
import AppShell from '../components/common/AppShell';
import useAuth from '../hooks/useAuth';
import { doctorAPI, appointmentAPI, queueAPI } from '../services/api';

const getLocalDateISO = () => {
  const now = new Date();
  const shifted = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return shifted.toISOString().slice(0, 10);
};
const ACTIVE_APPOINTMENT_STATUSES = new Set(['pending', 'confirmed', 'in-progress', 'waiting', 'called']);
const normalizeStatus = (value) => String(value || '').trim().toLowerCase();

const DoctorDashboardPage = () => {
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getLocalDateISO());
  const [updatingId, setUpdatingId] = useState('');
  const visibleAppointments = todayAppointments.filter((appointment) =>
    ACTIVE_APPOINTMENT_STATUSES.has(normalizeStatus(appointment.status))
  );

  useEffect(() => {
    const load = async () => {
      const doctors = await doctorAPI.list();
      const myDoctor = doctors.data.find((d) => String(d.userId?._id || d.userId) === String(user._id));
      setDoctor(myDoctor || null);
      if (myDoctor) {
        const list = await appointmentAPI.doctorToday(myDoctor._id, selectedDate);
        setTodayAppointments(list.data);
      }
    };

    load();
  }, [user._id, selectedDate]);

  const markTreatmentDone = async (appointmentId) => {
    if (!appointmentId) return;
    setUpdatingId(appointmentId);
    try {
      await queueAPI.updateStatus(appointmentId, { status: 'completed' });
      if (doctor?._id) {
        const list = await appointmentAPI.doctorToday(doctor._id, selectedDate);
        setTodayAppointments(list.data);
      }
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <AppShell title="Doctor Dashboard">
      <div className="mb-4 rounded-2xl bg-white p-4 shadow-card">
        <label className="text-sm font-medium text-teal-700">
          View Appointments For Date
          <input
            type="date"
            className="mt-1 block rounded-lg border border-teal-200 px-3 py-2"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-card">
          <p className="text-sm text-teal-600">Appointments</p>
          <p className="mt-2 text-3xl font-bold text-primary">{visibleAppointments.length}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-card">
          <p className="text-sm text-teal-600">Availability</p>
          <p className="mt-2 text-xl font-semibold">{doctor?.isAvailableToday ? 'Available' : 'Not Available'}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-card">
          <p className="text-sm text-teal-600">Specialization</p>
          <p className="mt-2 text-xl font-semibold">{doctor?.specialization || '-'}</p>
        </div>
      </div>
      <div className="mt-4 rounded-2xl bg-white p-5 shadow-card">
        <p className="text-sm font-semibold text-teal-700">Appointment Details</p>
        <div className="mt-3 space-y-2">
          {visibleAppointments.length ? (
            visibleAppointments.map((appointment) => (
              <article key={appointment._id} className="rounded-lg border border-teal-100 p-3">
                <p className="font-medium text-ink">{appointment.patientId?.userId?.name || 'Walk-in Patient'}</p>
                <p className="text-sm text-teal-700">{appointment.date} · {appointment.timeSlot} · Token #{appointment.tokenNumber || '-'}</p>
                <p className="text-sm">Status: {appointment.status}</p>
                <p className="text-sm text-slate-700">
                  Notes: {appointment.notes ? appointment.notes : 'No notes provided by patient.'}
                </p>
                {ACTIVE_APPOINTMENT_STATUSES.has(normalizeStatus(appointment.status)) ? (
                  <button
                    onClick={() => markTreatmentDone(appointment._id)}
                    disabled={updatingId === appointment._id}
                    className="mt-2 rounded-lg bg-primary px-3 py-1.5 text-sm text-white disabled:opacity-60"
                  >
                    {updatingId === appointment._id ? 'Updating...' : 'Complete Treatment'}
                  </button>
                ) : null}
              </article>
            ))
          ) : (
            <p className="text-sm text-teal-700">No appointments for selected date.</p>
          )}
        </div>
      </div>
    </AppShell>
  );
};

export default DoctorDashboardPage;
