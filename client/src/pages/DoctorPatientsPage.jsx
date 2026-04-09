import { useEffect, useState } from 'react';
import AppShell from '../components/common/AppShell';
import useAuth from '../hooks/useAuth';
import { appointmentAPI, doctorAPI } from '../services/api';

const getLocalDateISO = () => {
  const now = new Date();
  const shifted = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return shifted.toISOString().slice(0, 10);
};

const DoctorPatientsPage = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getLocalDateISO());

  useEffect(() => {
    const load = async () => {
      const doctors = await doctorAPI.list();
      const me = doctors.data.find((d) => String(d.userId?._id || d.userId) === String(user._id));
      if (!me) return;
      const list = await appointmentAPI.doctorToday(me._id, selectedDate);
      setAppointments(list.data);
    };

    load();
  }, [user._id, selectedDate]);

  return (
    <AppShell title="Today's Patients">
      <div className="mb-4 rounded-2xl bg-white p-4 shadow-card">
        <label className="text-sm font-medium text-teal-700">
          View Patients For Date
          <input
            type="date"
            className="mt-1 block rounded-lg border border-teal-200 px-3 py-2"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </label>
      </div>
      <div className="space-y-2">
        {appointments.map((appointment) => (
          <article key={appointment._id} className="rounded-xl bg-white p-4 shadow-card">
            <p className="font-semibold">{appointment.patientId?.userId?.name || 'Walk-in Patient'}</p>
            <p className="text-sm text-teal-700">{appointment.date} · {appointment.timeSlot} · Token #{appointment.tokenNumber || '-'}</p>
            <p className="text-sm">Status: {appointment.status}</p>
            <p className="text-sm text-slate-700">Notes: {appointment.notes || 'No notes provided by patient.'}</p>
          </article>
        ))}
      </div>
    </AppShell>
  );
};

export default DoctorPatientsPage;
