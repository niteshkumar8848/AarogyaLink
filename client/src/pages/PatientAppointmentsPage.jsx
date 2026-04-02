import { useEffect, useState } from 'react';
import AppShell from '../components/common/AppShell';
import { appointmentAPI } from '../services/api';
import { formatDate } from '../utils/formatDate';

const PatientAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);

  const load = async () => {
    const { data } = await appointmentAPI.listMine();
    setAppointments(data);
  };

  useEffect(() => {
    load();
  }, []);

  const cancelAppointment = async (id) => {
    await appointmentAPI.update(id, { status: 'cancelled' });
    load();
  };

  return (
    <AppShell title="My Appointments">
      <div className="space-y-3">
        {appointments.map((appointment) => (
          <article key={appointment._id} className="rounded-2xl bg-white p-4 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{appointment.date} · {appointment.timeSlot}</p>
                <p className="text-sm text-teal-700">Status: {appointment.status} · Token: {appointment.tokenNumber || '-'}</p>
                <p className="text-xs text-gray-500">Booked: {formatDate(appointment.createdAt)}</p>
              </div>
              {['confirmed', 'pending'].includes(appointment.status) ? (
                <button onClick={() => cancelAppointment(appointment._id)} className="rounded-lg border border-red-300 px-3 py-1 text-sm text-red-600">
                  Cancel
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </AppShell>
  );
};

export default PatientAppointmentsPage;
