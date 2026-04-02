import { useEffect, useState } from 'react';
import AppShell from '../components/common/AppShell';
import { doctorAPI, queueAPI } from '../services/api';

const AdminQueuesPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [queue, setQueue] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    doctorAPI.list().then(({ data }) => {
      setDoctors(data);
      if (data[0]) setSelectedDoctor(data[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!selectedDoctor || !date) return;
    queueAPI.getByDoctorDate(selectedDoctor, date).then(({ data }) => setQueue(data));
  }, [selectedDoctor, date]);

  const reset = async () => {
    const doctor = doctors.find((d) => d._id === selectedDoctor);
    const hospitalId = doctor?.hospitals?.[0]?.hospitalId?._id || doctor?.hospitals?.[0]?.hospitalId;
    await queueAPI.reset({ doctorId: selectedDoctor, hospitalId, date });
    const { data } = await queueAPI.getByDoctorDate(selectedDoctor, date);
    setQueue(data);
  };

  return (
    <AppShell title="Queue Oversight">
      <div className="mb-3 flex flex-wrap gap-2">
        <select className="rounded border border-teal-200 px-2 py-1" value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)}>
          {doctors.map((doctor) => <option key={doctor._id} value={doctor._id}>Dr. {doctor.userId?.name}</option>)}
        </select>
        <input type="date" className="rounded border border-teal-200 px-2 py-1" value={date} onChange={(e) => setDate(e.target.value)} />
        <button onClick={reset} className="rounded bg-red-600 px-3 py-1 text-white">Reset Queue</button>
      </div>
      <pre className="rounded-xl bg-white p-4 text-xs shadow-card">{JSON.stringify(queue, null, 2)}</pre>
    </AppShell>
  );
};

export default AdminQueuesPage;
