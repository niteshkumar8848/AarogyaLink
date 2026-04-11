import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentAPI } from '../../services/api';
import DummyPaymentScreen from './DummyPaymentScreen';

const WEEK_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const toDayFromISODate = (value) => {
  const [year, month, day] = String(value || '').split('-').map(Number);
  if (!year || !month || !day) return '';
  const index = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return WEEK_DAYS[index] || '';
};

const getLocalTodayISO = () => {
  const now = new Date();
  const shifted = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return shifted.toISOString().slice(0, 10);
};

const isPastSlotForTodayLocal = (date, slotLabel) => {
  const selectedDate = String(date || '').trim();
  const todayISO = getLocalTodayISO();
  if (selectedDate !== todayISO) return false;

  const slotStart = String(slotLabel || '').split('-')[0]?.trim();
  if (!/^\d{2}:\d{2}$/.test(slotStart || '')) return false;
  const [hour, minute] = slotStart.split(':').map(Number);
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const slotMinutes = hour * 60 + minute;
  return slotMinutes <= nowMinutes;
};

const filterFutureSlots = (date, slots = []) => (slots || []).filter((slot) => !isPastSlotForTodayLocal(date, slot));

const BookingWidget = ({ doctor, hospitals = [] }) => {
  const navigate = useNavigate();
  const doctorName = doctor.userId?.name || 'Doctor';
  const doctorPhoto = doctor.userId?.profilePhoto;
  const appointmentPrice = Math.max(0, Number(doctor.appointmentPrice ?? 500) || 0);
  const defaultHospitalId = hospitals?.[0]?._id || '';
  const [form, setForm] = useState({
    hospitalId: defaultHospitalId,
    date: '',
    timeSlot: '',
    notes: ''
  });
  const [availability, setAvailability] = useState({
    loading: false,
    error: '',
    day: '',
    availableSlots: [],
    note: ''
  });
  const [payment, setPayment] = useState({
    done: false,
    method: '',
    transactionId: '',
    mobileNumber: ''
  });
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [message, setMessage] = useState('');

  const selectedDateDay = useMemo(() => toDayFromISODate(form.date), [form.date]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, hospitalId: defaultHospitalId, timeSlot: '' }));
  }, [defaultHospitalId]);

  useEffect(() => {
    if (!form.date || !form.hospitalId) {
      setAvailability({ loading: false, error: '', day: selectedDateDay, availableSlots: [], note: '' });
      return;
    }

    let isAlive = true;
    const loadAvailability = async () => {
      setAvailability((prev) => ({ ...prev, loading: true, error: '', day: selectedDateDay }));
      try {
        const { data } = await appointmentAPI.availability(doctor._id, {
          date: form.date,
          hospitalId: form.hospitalId
        });
        const filteredSlots = filterFutureSlots(form.date, data.availableSlots || []);
        if (!isAlive) return;
        setAvailability({
          loading: false,
          error: '',
          day: data.day || selectedDateDay,
          availableSlots: filteredSlots,
          note:
            data.note ||
            (filteredSlots.length
              ? ''
              : form.date === getLocalTodayISO()
                ? 'No remaining slot available for today.'
                : '')
        });
        setForm((prev) => ({
          ...prev,
          timeSlot:
            filteredSlots.includes(prev.timeSlot)
              ? prev.timeSlot
              : filteredSlots[0] || ''
        }));
      } catch (error) {
        if (!isAlive) return;
        setAvailability({
          loading: false,
          error: error.response?.data?.message || 'Could not load available slots.',
          day: selectedDateDay,
          availableSlots: [],
          note: ''
        });
        setForm((prev) => ({ ...prev, timeSlot: '' }));
      }
    };

    loadAvailability();
    return () => {
      isAlive = false;
    };
  }, [doctor._id, form.date, form.hospitalId, selectedDateDay]);

  useEffect(() => {
    setPayment({
      done: false,
      method: '',
      transactionId: '',
      mobileNumber: ''
    });
  }, [form.hospitalId, form.date, form.timeSlot]);

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!form.timeSlot) {
      setMessage('Please select an available time slot first.');
      return;
    }
    if (isPastSlotForTodayLocal(form.date, form.timeSlot)) {
      setMessage('Selected slot time has already passed for today. Please choose a future slot.');
      return;
    }
    if (!payment.done) {
      setMessage('Complete online payment before confirming the booking.');
      return;
    }

    setMessage('Booking...');

    try {
      const { data } = await appointmentAPI.book({
        doctorId: doctor._id,
        hospitalId: form.hospitalId,
        date: form.date,
        timeSlot: form.timeSlot,
        notes: form.notes,
        payment: {
          method: payment.method,
          transactionId: payment.transactionId,
          mobileNumber: payment.mobileNumber,
          success: true
        }
      });
      const tokenNumber = data?.queue?.tokenNumber;
      navigate('/patient/dashboard', {
        state: {
          bookingSuccess: {
            tokenNumber,
            doctorName,
            date: form.date,
            timeSlot: form.timeSlot
          }
        }
      });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Booking failed');
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-teal-100 bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-2xl font-semibold text-ink">Book Appointment</h3>
          <p className="text-sm text-teal-700">Choose slot, complete payment, then confirm booking.</p>
        </div>
        <p className="rounded-lg bg-teal-50 px-3 py-1 text-sm font-medium text-teal-900">
          Fee: NPR {appointmentPrice}
        </p>
      </div>

      {hospitals.length > 1 ? (
        <div className="space-y-1">
          <label className="text-sm font-medium text-teal-900">Hospital</label>
          <select
            className="w-full rounded-lg border border-teal-200 px-3 py-2"
            value={form.hospitalId}
            onChange={(e) => setForm((prev) => ({ ...prev, hospitalId: e.target.value }))}
            required
          >
            {hospitals.map((hospital) => (
              <option key={hospital._id} value={hospital._id}>
                {hospital.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="space-y-1">
        <label className="text-sm font-medium text-teal-900">Appointment Date</label>
        <input
          type="date"
          className="w-full rounded-lg border border-teal-200 px-3 py-2"
          value={form.date}
          min={getLocalTodayISO()}
          onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
          required
        />
      </div>
      <div className="rounded-lg border border-teal-100 bg-teal-50/40 p-3 text-sm text-teal-900">
        <p className="font-medium">Selected Day: {availability.day || selectedDateDay || '-'}</p>
        {availability.loading ? <p className="mt-1 text-xs text-teal-700">Checking available time slots...</p> : null}
        {availability.note ? <p className="mt-1 text-xs text-teal-700">{availability.note}</p> : null}
        {availability.error ? <p className="mt-1 text-xs text-red-600">{availability.error}</p> : null}
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-teal-900">Available Time Slot</label>
        <select
          className="w-full rounded-lg border border-teal-200 px-3 py-2"
          value={form.timeSlot}
          onChange={(e) => setForm((prev) => ({ ...prev, timeSlot: e.target.value }))}
          required
          disabled={!availability.availableSlots.length || availability.loading}
        >
          {!availability.availableSlots.length ? (
            <option value="">No available slot for selected date</option>
          ) : null}
          {availability.availableSlots.map((slot) => (
            <option key={slot} value={slot}>
              {slot}
            </option>
          ))}
        </select>
      </div>

      <textarea
        className="w-full rounded-lg border border-teal-200 px-3 py-2"
        placeholder="Notes (optional)"
        value={form.notes}
        onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
      />
      {payment.done ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Payment verified via {payment.method.replace('_', ' ')}.
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setPaymentOpen(true)}
        disabled={!form.date || !form.timeSlot}
        className="w-full rounded-lg border border-primary px-4 py-2 font-medium text-primary hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {payment.done ? `Payment Success (${payment.method})` : 'Proceed To Online Payment'}
      </button>
      <button
        className="w-full rounded-lg bg-primary px-4 py-2 font-medium text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={!payment.done || !form.timeSlot}
      >
        Confirm Booking
      </button>
      <p className="min-h-5 text-sm text-teal-700">{message}</p>

      <DummyPaymentScreen
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        doctorName={doctorName}
        doctorPhoto={doctorPhoto}
        date={form.date}
        timeSlot={form.timeSlot}
        amount={appointmentPrice}
        onSuccess={(paymentData) =>
          setPayment({
            done: true,
            method: paymentData.method,
            transactionId: paymentData.transactionId,
            mobileNumber: paymentData.mobileNumber
          })
        }
      />
    </form>
  );
};

export default BookingWidget;
