import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AppShell from '../components/common/AppShell';
import QueueStatusWidget from '../components/patient/QueueStatusWidget';
import { queueAPI } from '../services/api';
import useSocket from '../hooks/useSocket';

const PatientQueuePage = () => {
  const { appointmentId } = useParams();
  const [queue, setQueue] = useState(null);
  const socket = useSocket();

  const load = async () => {
    const { data } = await queueAPI.patientStatus(appointmentId);
    setQueue(data);
  };

  useEffect(() => {
    load();
  }, [appointmentId]);

  useEffect(() => {
    if (!socket || !queue?.doctorId) return;

    socket.emit('queue:join', { appointmentId, doctorId: queue.doctorId });
    const handler = () => load();
    socket.on('queue:updated', handler);
    socket.on('appointment:called', handler);

    return () => {
      socket.emit('queue:leave', { appointmentId, doctorId: queue.doctorId });
      socket.off('queue:updated', handler);
      socket.off('appointment:called', handler);
    };
  }, [socket, queue?.doctorId, appointmentId]);

  return (
    <AppShell title="Live Queue Tracker">
      <QueueStatusWidget queue={queue} />
    </AppShell>
  );
};

export default PatientQueuePage;
