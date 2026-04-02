import { useEffect, useState } from 'react';
import AppShell from '../components/common/AppShell';
import { appointmentAPI, doctorAPI, hospitalAPI } from '../services/api';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({ doctors: 0, hospitals: 0, appointments: 0 });

  useEffect(() => {
    const load = async () => {
      const [doctors, hospitals, appointments] = await Promise.all([
        doctorAPI.list(),
        hospitalAPI.list(),
        appointmentAPI.listAdmin()
      ]);
      setStats({
        doctors: doctors.data.length,
        hospitals: hospitals.data.length,
        appointments: appointments.data.length
      });
    };

    load();
  }, []);

  return (
    <AppShell title="Admin Dashboard">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-card"><p className="text-sm text-teal-700">Doctors</p><p className="text-3xl font-bold text-primary">{stats.doctors}</p></div>
        <div className="rounded-2xl bg-white p-5 shadow-card"><p className="text-sm text-teal-700">Hospitals</p><p className="text-3xl font-bold text-primary">{stats.hospitals}</p></div>
        <div className="rounded-2xl bg-white p-5 shadow-card"><p className="text-sm text-teal-700">Appointments</p><p className="text-3xl font-bold text-primary">{stats.appointments}</p></div>
      </div>
    </AppShell>
  );
};

export default AdminDashboardPage;
