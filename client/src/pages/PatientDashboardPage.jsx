import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AppShell from '../components/common/AppShell';
import QueueStatusWidget from '../components/patient/QueueStatusWidget';
import { appointmentAPI, queueAPI } from '../services/api';

const ACTIVE_STATUSES = ['pending', 'confirmed', 'in-progress'];

const toSortableTime = (value) => {
  const [start] = String(value || '').split('-');
  const [h = '0', m = '0'] = start.split(':');
  return Number(h) * 60 + Number(m);
};

const pickActiveAppointment = (appointments = []) => {
  const active = appointments.filter((item) => ACTIVE_STATUSES.includes(item.status));
  if (!active.length) return null;

  const inProgress = active.find((item) => item.status === 'in-progress');
  if (inProgress) return inProgress;

  const upcoming = active
    .filter((item) => item.status === 'confirmed' || item.status === 'pending')
    .sort((a, b) => {
      if (a.date !== b.date) return String(a.date).localeCompare(String(b.date));
      return toSortableTime(a.timeSlot) - toSortableTime(b.timeSlot);
    });
  return upcoming[0] || active[0];
};

const PatientDashboardPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [queue, setQueue] = useState(null);
  const [bookingBanner, setBookingBanner] = useState(null);
  const upcomingAppointments = appointments
    .filter((item) => ACTIVE_STATUSES.includes(item.status))
    .sort((a, b) => {
      if (a.date !== b.date) return String(a.date).localeCompare(String(b.date));
      return toSortableTime(a.timeSlot) - toSortableTime(b.timeSlot);
    })
    .slice(0, 5);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await appointmentAPI.listMine();
        setAppointments(data);
        const active = pickActiveAppointment(data);
        if (active) {
          const queueRes = await queueAPI.patientStatus(active._id);
          setQueue(queueRes.data);
        } else {
          setQueue(null);
        }
      } catch {
        setAppointments([]);
        setQueue(null);
      }
    };

    load();
    const intervalId = setInterval(load, 8000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const success = location.state?.bookingSuccess;
    if (!success) return;
    setBookingBanner(success);
    navigate('/patient/dashboard', { replace: true });
  }, [location.state, navigate]);

  return (
    <AppShell title="Patient Dashboard">
      {bookingBanner ? (
        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900 shadow-card">
          <p className="font-semibold">Booked Successfully</p>
          <p className="text-sm">
            Your token number is <span className="font-semibold">#{bookingBanner.tokenNumber ?? '-'}</span>
            {bookingBanner.doctorName ? ` with Dr. ${bookingBanner.doctorName}` : ''}.
          </p>
        </div>
      ) : null}
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
