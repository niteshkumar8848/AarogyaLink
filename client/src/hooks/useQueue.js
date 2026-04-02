import { useEffect, useState } from 'react';
import { queueAPI } from '../services/api';

const useQueue = (appointmentId) => {
  const [queue, setQueue] = useState(null);

  useEffect(() => {
    if (!appointmentId) return;
    queueAPI.patientStatus(appointmentId).then(({ data }) => setQueue(data));
  }, [appointmentId]);

  return queue;
};

export default useQueue;
