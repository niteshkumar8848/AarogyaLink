import { useEffect, useState } from 'react';
import AppShell from '../components/common/AppShell';
import QueueStatusWidget from '../components/patient/QueueStatusWidget';
import { appointmentAPI, queueAPI } from '../services/api';

const PatientDashboardPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [queue, setQueue] = useState(null);
  const upcomingAppointments = appointments
    .filter((item) => ['pending', 'confirmed', 'in-progress'].includes(item.status))
    .slice(0, 5);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await appointmentAPI.listMine();
        setAppointments(data);
        const active = data.find((a) => ['confirmed', 'in-progress', 'pending'].includes(a.status));
        if (active) {
          const queueRes = await queueAPI.patientStatus(active._id);
          setQueue(queueRes.data);
        }
      } catch {
        setAppointments([]);
      }
    };

    load();
  }, []);

  return (
    <AppShell title="Patient Dashboard">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <QueueStatusWidget queue={queue} />
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-card">
          <p className="text-sm text-teal-600">Upcoming Appointments</p>
          <div className="mt-3 space-y-2 text-sm">
            {upcomingAppointments.map((item) => (
              <div key={item._id} className="rounded-lg border border-teal-100 p-2">
                <p className="font-medium">{item.date} · {item.timeSlot}</p>
                <p>Status: {item.status}</p>
              </div>
            ))}
            {!upcomingAppointments.length ? <p>No upcoming appointments.</p> : null}
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default PatientDashboardPage;
