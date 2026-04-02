import { useEffect, useState } from 'react';
import AppShell from '../components/common/AppShell';
import { appointmentAPI } from '../services/api';

const AdminAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    appointmentAPI.listAdmin().then(({ data }) => setAppointments(data));
  }, []);

  return (
    <AppShell title="All Appointments">
      <div className="space-y-2">
        {appointments.map((appointment) => (
          <div key={appointment._id} className="rounded-xl bg-white p-4 shadow-card">
            <p className="font-semibold">{appointment.date} · {appointment.timeSlot}</p>
            <p className="text-sm text-teal-700">Doctor: {appointment.doctorId?.userId?.name || '-'} · Hospital: {appointment.hospitalId?.name || '-'}</p>
            <p className="text-sm">Status: {appointment.status} · Token: {appointment.tokenNumber || '-'}</p>
          </div>
        ))}
      </div>
    </AppShell>
  );
};

export default AdminAppointmentsPage;
