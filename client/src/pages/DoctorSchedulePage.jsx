import { useEffect, useState } from 'react';
import AppShell from '../components/common/AppShell';
import useAuth from '../hooks/useAuth';
import ScheduleView from '../components/doctor/ScheduleView';
import { doctorAPI } from '../services/api';

const DoctorSchedulePage = () => {
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [dateAvailability, setDateAvailability] = useState([]);
  const [dateForm, setDateForm] = useState({ date: '', isAvailable: true });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const sanitizeSchedulePayload = (hospitals = []) =>
    hospitals.map((hospital) => ({
      hospitalId: hospital?.hospitalId?._id || hospital?.hospitalId,
      schedule: (hospital?.schedule || [])
        .map((daySchedule) => ({
          day: String(daySchedule?.day || '').trim(),
          slots: (daySchedule?.slots || [])
            .map((slot) => ({
              startTime: String(slot?.startTime || '').trim(),
              endTime: String(slot?.endTime || '').trim()
            }))
            .filter((slot) => slot.startTime && slot.endTime && slot.startTime < slot.endTime)
        }))
        .filter((daySchedule) => daySchedule.day && daySchedule.slots.length)
    }));

  const sanitizeDateAvailabilityPayload = (entries = []) => {
    const map = new Map();
    entries.forEach((entry) => {
      const date = String(entry?.date || '').trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
      map.set(date, { date, isAvailable: Boolean(entry?.isAvailable) });
    });
    return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
  };

  useEffect(() => {
    const load = async () => {
      try {
        const doctors = await doctorAPI.list();
        const me = doctors.data.find((d) => String(d.userId?._id || d.userId) === String(user._id));
        setDoctor(me || null);
        setSchedule(me?.hospitals || []);
        setDateAvailability(me?.dateAvailability || []);
      } catch (error) {
        setMessage(error.response?.data?.message || 'Failed to load doctor schedule.');
      }
    };

    load();
  }, [user._id]);

  const save = async () => {
    if (!doctor?._id) return;
    setSaving(true);
    setMessage('Saving schedule...');
    try {
      const hospitals = sanitizeSchedulePayload(schedule);
      const normalizedDateAvailability = sanitizeDateAvailabilityPayload(dateAvailability);
      await doctorAPI.update(doctor._id, {
        hospitals,
        dateAvailability: normalizedDateAvailability
      });
      setMessage('Schedule updated successfully.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update schedule.');
    } finally {
      setSaving(false);
    }
  };

  const addOrUpdateDateAvailability = () => {
    if (!dateForm.date) return;
    setDateAvailability((prev) =>
      sanitizeDateAvailabilityPayload([
        ...prev.filter((item) => item.date !== dateForm.date),
        { date: dateForm.date, isAvailable: Boolean(dateForm.isAvailable) }
      ])
    );
    setDateForm({ date: '', isAvailable: true });
  };

  const removeDateAvailability = (date) => {
    setDateAvailability((prev) => prev.filter((item) => item.date !== date));
  };

  return (
    <AppShell title="Schedule Management">
      <ScheduleView schedule={schedule} onChange={setSchedule} />
      <div className="mt-4 rounded-2xl bg-white p-5 shadow-card">
        <p className="text-sm text-teal-600">Date-wise Availability Override</p>
        <p className="text-xs text-teal-700">Set specific date as available or unavailable. This reflects on patient booking.</p>

        <div className="mt-3 grid gap-2 md:grid-cols-[1fr_220px_auto]">
          <input
            type="date"
            value={dateForm.date}
            onChange={(e) => setDateForm((prev) => ({ ...prev, date: e.target.value }))}
            className="rounded-lg border border-teal-200 px-3 py-2"
          />
          <select
            value={String(dateForm.isAvailable)}
            onChange={(e) => setDateForm((prev) => ({ ...prev, isAvailable: e.target.value === 'true' }))}
            className="rounded-lg border border-teal-200 px-3 py-2"
          >
            <option value="true">Available</option>
            <option value="false">Unavailable</option>
          </select>
          <button
            type="button"
            onClick={addOrUpdateDateAvailability}
            className="rounded-lg border border-teal-300 px-3 py-2 text-sm text-teal-700"
          >
            Add/Update
          </button>
        </div>

        <div className="mt-3 space-y-2">
          {dateAvailability.length ? (
            dateAvailability.map((item) => (
              <div key={item.date} className="flex items-center justify-between rounded-lg border border-teal-100 px-3 py-2 text-sm">
                <p>
                  <span className="font-medium">{item.date}</span> - {item.isAvailable ? 'Available' : 'Unavailable'}
                </p>
                <button
                  type="button"
                  onClick={() => removeDateAvailability(item.date)}
                  className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600"
                >
                  Remove
                </button>
              </div>
            ))
          ) : (
            <p className="text-xs text-teal-700">No date override added yet.</p>
          )}
        </div>
      </div>
      <button
        onClick={save}
        disabled={!doctor?._id || saving}
        className="mt-3 rounded-lg bg-primary px-4 py-2 text-white disabled:opacity-60"
      >
        {saving ? 'Saving...' : 'Save Schedule'}
      </button>
      <p className="mt-2 text-sm text-teal-700">{message}</p>
    </AppShell>
  );
};

export default DoctorSchedulePage;
