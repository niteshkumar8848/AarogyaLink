import { useEffect, useMemo, useState } from 'react';
import AppShell from '../components/common/AppShell';
import useAuth from '../hooks/useAuth';
import { appointmentAPI, doctorAPI } from '../services/api';

const DoctorEarningsPage = () => {
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    totalPaidAppointments: 0,
    totalTreatedPatients: 0,
    todaysEarning: 0,
    last7Days: []
  });

  useEffect(() => {
    const load = async () => {
      const doctors = await doctorAPI.list();
      const myDoctor = doctors.data.find((d) => String(d.userId?._id || d.userId) === String(user._id));
      setDoctor(myDoctor || null);
      if (!myDoctor?._id) return;
      const { data } = await appointmentAPI.doctorEarnings(myDoctor._id);
      setEarnings(data || { totalEarnings: 0, totalPaidAppointments: 0, totalTreatedPatients: 0, todaysEarning: 0, last7Days: [] });
    };

    load();
    const intervalId = setInterval(load, 15000);
    return () => clearInterval(intervalId);
  }, [user._id]);

  const maxEarning = useMemo(
    () => Math.max(...(earnings.last7Days || []).map((item) => Number(item.earning || 0)), 1),
    [earnings.last7Days]
  );

  return (
    <AppShell title="Earnings">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-card">
          <p className="text-sm text-teal-600">Doctor</p>
          <p className="mt-2 text-xl font-semibold">{doctor?.userId?.name || '-'}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-card">
          <p className="text-sm text-teal-600">Total Earnings</p>
          <p className="mt-2 text-2xl font-bold text-primary">NPR {Number(earnings.totalEarnings || 0).toLocaleString()}</p>
          <p className="text-xs text-slate-500">From successful payments</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-card">
          <p className="text-sm text-teal-600">Today's Earning</p>
          <p className="mt-2 text-2xl font-bold text-primary">NPR {Number(earnings.todaysEarning || 0).toLocaleString()}</p>
          <p className="text-xs text-slate-500">Paid Appointments: {earnings.totalPaidAppointments || 0}</p>
          <p className="text-xs text-slate-500">Treated Patients: {earnings.totalTreatedPatients || 0}</p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-white p-5 shadow-card">
        <p className="text-sm font-semibold text-teal-700">Last 7 Days Earnings</p>
        <div className="mt-3 flex items-end gap-3 overflow-x-auto">
          {(earnings.last7Days || []).map((item) => {
            const barHeight = Math.max(8, Math.round((Number(item.earning || 0) / maxEarning) * 130));
            return (
              <div key={item.date} className="min-w-[64px] text-center">
                <p className="mb-1 text-[11px] text-slate-600">NPR {Number(item.earning || 0).toLocaleString()}</p>
                <div className="mx-auto w-10 rounded-t bg-teal-500" style={{ height: `${barHeight}px` }} />
                <p className="mt-1 text-[11px] text-slate-500">{item.date.slice(5)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
};

export default DoctorEarningsPage;
