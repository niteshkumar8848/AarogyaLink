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

  const selectedDoctorProfile = doctors.find((d) => d._id === selectedDoctor);
  const doctorName = selectedDoctorProfile?.userId?.name || 'Doctor';
  const doctorSpecialization = selectedDoctorProfile?.specialization || '-';
  const hospitalName =
    selectedDoctorProfile?.hospitalName ||
    selectedDoctorProfile?.hospitals?.[0]?.hospitalId?.name ||
    'N/A';
  const queueEntries = queue?.entries || [];
  const waitingCount = queueEntries.filter((item) => ['waiting', 'called', 'in-progress'].includes(item.status)).length;
  const doneCount = queueEntries.filter((item) => item.status === 'completed').length;

  return (
    <AppShell title="Queue Oversight">
      <div className="mb-4 flex flex-wrap gap-2 rounded-2xl bg-white p-4 shadow-card">
        <select className="rounded-lg border border-teal-200 px-3 py-2" value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)}>
          {doctors.map((doctor) => <option key={doctor._id} value={doctor._id}>Dr. {doctor.userId?.name}</option>)}
        </select>
        <input type="date" className="rounded-lg border border-teal-200 px-3 py-2" value={date} onChange={(e) => setDate(e.target.value)} />
        <button onClick={reset} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white">Reset Queue</button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl bg-white p-4 shadow-card">
          <p className="text-sm text-teal-700">Doctor</p>
          <p className="mt-1 font-semibold text-ink">Dr. {doctorName}</p>
          <p className="text-xs text-teal-700">{doctorSpecialization}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-card">
          <p className="text-sm text-teal-700">Hospital</p>
          <p className="mt-1 font-semibold text-ink">{hospitalName}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-card">
          <p className="text-sm text-teal-700">Current Token</p>
          <p className="mt-1 text-2xl font-bold text-primary">#{queue?.currentToken || 0}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-card">
          <p className="text-sm text-teal-700">Queue Summary</p>
          <p className="mt-1 text-sm text-ink">Waiting/Active: <strong>{waitingCount}</strong></p>
          <p className="text-sm text-ink">Completed: <strong>{doneCount}</strong></p>
          <p className="text-sm text-ink">Total Tokens: <strong>{queue?.totalTokens || 0}</strong></p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-white p-4 shadow-card">
        <h3 className="text-lg font-semibold text-ink">Queue Entries</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-teal-100 text-teal-700">
                <th className="py-2 pr-2">Token</th>
                <th className="py-2 pr-2">Patient</th>
                <th className="py-2 pr-2">Date</th>
                <th className="py-2 pr-2">Time Slot</th>
                <th className="py-2 pr-2">Status</th>
                <th className="py-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {queueEntries.length ? (
                queueEntries.map((entry) => (
                  <tr key={entry.appointmentId?._id || entry.tokenNumber} className="border-b border-slate-100">
                    <td className="py-2 pr-2">#{entry.tokenNumber}</td>
                    <td className="py-2 pr-2">{entry.appointmentId?.patientId?.userId?.name || 'Walk-in Patient'}</td>
                    <td className="py-2 pr-2">{entry.appointmentId?.date || date}</td>
                    <td className="py-2 pr-2">{entry.appointmentId?.timeSlot || '-'}</td>
                    <td className="py-2 pr-2 capitalize">{entry.status || '-'}</td>
                    <td className="py-2">{entry.appointmentId?.notes || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-4 text-sm text-teal-700" colSpan={6}>No queue entries found for selected doctor and date.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
};

export default AdminQueuesPage;
