import { useEffect, useState } from 'react';
import AppShell from '../components/common/AppShell';
import useAuth from '../hooks/useAuth';
import QueueManager from '../components/doctor/QueueManager';
import { doctorAPI, queueAPI } from '../services/api';

const DoctorQueuePage = () => {
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [queue, setQueue] = useState(null);

  const today = new Date().toISOString().slice(0, 10);

  const loadQueue = async (doctorId, hospitalId) => {
    const { data } = await queueAPI.getByDoctorDate(doctorId, today);
    setQueue(data);
    return hospitalId;
  };

  useEffect(() => {
    const load = async () => {
      const doctors = await doctorAPI.list();
      const me = doctors.data.find((d) => String(d.userId?._id || d.userId) === String(user._id));
      setDoctor(me || null);
      if (me) await loadQueue(me._id);
    };

    load();
  }, [user._id]);

  const callNext = async () => {
    const hospitalId = doctor?.hospitals?.[0]?.hospitalId?._id || doctor?.hospitals?.[0]?.hospitalId;
    await queueAPI.next(doctor._id, { hospitalId, date: today });
    await loadQueue(doctor._id);
  };

  const markDone = async (appointmentId) => {
    if (!appointmentId) return;
    await queueAPI.updateStatus(appointmentId, { status: 'completed' });
    await loadQueue(doctor._id);
  };

  return (
    <AppShell title="Queue Management">
      <QueueManager queue={queue} onCallNext={callNext} onMarkDone={markDone} />
    </AppShell>
  );
};

export default DoctorQueuePage;
