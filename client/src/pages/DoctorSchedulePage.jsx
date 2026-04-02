import { useEffect, useState } from 'react';
import AppShell from '../components/common/AppShell';
import useAuth from '../hooks/useAuth';
import ScheduleView from '../components/doctor/ScheduleView';
import { doctorAPI } from '../services/api';

const DoctorSchedulePage = () => {
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    const load = async () => {
      const doctors = await doctorAPI.list();
      const me = doctors.data.find((d) => String(d.userId?._id || d.userId) === String(user._id));
      setDoctor(me || null);
      setSchedule(me?.hospitals || []);
    };

    load();
  }, [user._id]);

  const save = async () => {
    await doctorAPI.update(doctor._id, { hospitals: schedule });
    alert('Schedule updated');
  };

  return (
    <AppShell title="Schedule Management">
      <ScheduleView schedule={schedule} onChange={setSchedule} />
      <button onClick={save} className="mt-3 rounded-lg bg-primary px-4 py-2 text-white">Save Schedule</button>
    </AppShell>
  );
};

export default DoctorSchedulePage;
