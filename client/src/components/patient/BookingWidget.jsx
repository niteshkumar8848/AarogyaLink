import { useEffect, useState } from 'react';
import { appointmentAPI } from '../../services/api';

const BookingWidget = ({ doctor, hospitals = [] }) => {
  const defaultHospitalId = hospitals?.[0]?._id || '';
  const [form, setForm] = useState({
    hospitalId: defaultHospitalId,
    date: '',
    timeSlot: '09:00-09:30',
    notes: ''
  });
  const [message, setMessage] = useState('');
  useEffect(() => {
    setForm((prev) => ({ ...prev, hospitalId: defaultHospitalId }));
  }, [defaultHospitalId]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setMessage('Booking...');

    try {
      const { data } = await appointmentAPI.book({
        doctorId: doctor._id,
        hospitalId: form.hospitalId,
        date: form.date,
        timeSlot: form.timeSlot,
        notes: form.notes
      });
      setMessage(`Booked successfully. Token #${data.queue.tokenNumber}`);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Booking failed');
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-2xl bg-white p-5 shadow-card">
      <h3 className="text-lg font-semibold text-ink">Book Appointment</h3>
      <div className="rounded-lg border border-teal-100 bg-teal-50/60 px-3 py-2 text-sm text-teal-900">
        <p><span className="font-medium">Hospital:</span> {doctor.hospitalName || hospitals?.[0]?.name || 'N/A'}</p>
        <p><span className="font-medium">Location:</span> {doctor.location || hospitals?.[0]?.address || 'N/A'}</p>
        <p><span className="font-medium">Doctor Contact:</span> {doctor.doctorContactNumber || doctor.userId?.phone || 'N/A'}</p>
      </div>
      <input
        type="date"
        className="w-full rounded-lg border border-teal-200 px-3 py-2"
        value={form.date}
        onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
        required
      />
      <input
        type="text"
        className="w-full rounded-lg border border-teal-200 px-3 py-2"
        placeholder="Time slot (e.g., 09:00-09:30)"
        value={form.timeSlot}
        onChange={(e) => setForm((prev) => ({ ...prev, timeSlot: e.target.value }))}
        required
      />
      <textarea
        className="w-full rounded-lg border border-teal-200 px-3 py-2"
        placeholder="Notes (optional)"
        value={form.notes}
        onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
      />
      <button className="w-full rounded-lg bg-primary px-4 py-2 font-medium text-white hover:bg-teal-700">Confirm</button>
      <p className="text-sm text-teal-700">{message}</p>
    </form>
  );
};

export default BookingWidget;
