const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Hospital = require('../models/Hospital');
const { addAppointmentToQueue, cancelAppointmentInQueue } = require('../services/queueService');
const { createNotification } = require('../services/notificationService');

const getDoctorProfileForUser = async (userId) => Doctor.findOne({ userId }).select('_id');
const WEEK_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const ALLOWED_PAYMENT_METHODS = ['esewa', 'khalti', 'mobile_banking'];
const normalizeId = (value) => String(value?._id || value || '');

const getDayNameFromISODate = (date) => {
  const [year, month, day] = String(date || '').split('-').map(Number);
  if (!year || !month || !day) return null;
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return WEEK_DAYS[weekday] || null;
};

const getDoctorHospitalSchedule = ({ doctor, hospitalId }) => {
  const hospitals = Array.isArray(doctor?.hospitals) ? doctor.hospitals : [];
  if (!hospitals.length) return null;
  if (!hospitalId) return hospitals[0];
  const targetHospitalId = normalizeId(hospitalId);
  return hospitals.find((item) => normalizeId(item?.hospitalId) === targetHospitalId) || null;
};

const buildSlotLabel = (slot) => {
  const start = String(slot?.startTime || '').trim();
  const end = String(slot?.endTime || '').trim();
  return start && end ? `${start}-${end}` : '';
};

const getScheduleSlotsForDate = ({ schedule = [], date }) => {
  const dayName = getDayNameFromISODate(date);
  if (!dayName) return { dayName: null, slots: [] };

  const daySchedule = schedule.find((item) => String(item?.day || '').toLowerCase() === dayName.toLowerCase());
  if (!daySchedule) return { dayName, slots: [] };

  const slots = (daySchedule.slots || []).map(buildSlotLabel).filter(Boolean);
  return { dayName, slots };
};

const getDateAvailabilityOverride = ({ doctor, date }) => {
  const entries = Array.isArray(doctor?.dateAvailability) ? doctor.dateAvailability : [];
  return entries.find((item) => String(item?.date) === String(date)) || null;
};

const getPatientAppointments = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) return res.status(404).json({ message: 'Patient profile not found' });

    const appointments = await Appointment.find({ patientId: patient._id })
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } })
      .populate('hospitalId', 'name address')
      .sort({ createdAt: -1 });

    return res.json(appointments);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch appointments', error: error.message });
  }
};

const bookAppointment = async (req, res) => {
  try {
    const { doctorId, hospitalId, date, timeSlot, notes, priority = 'normal', payment } = req.body;

    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    const paymentMethod = String(payment?.method || '').trim().toLowerCase();
    const paymentTransactionId = String(payment?.transactionId || '').trim();
    const paymentSuccessful = Boolean(payment?.success);
    if (!paymentSuccessful || !ALLOWED_PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({ message: 'Successful online payment is required before booking confirmation' });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const dateOverride = getDateAvailabilityOverride({ doctor, date });
    if (dateOverride && !dateOverride.isAvailable) {
      return res.status(400).json({ message: `Doctor is marked unavailable on ${date}` });
    }

    let resolvedHospitalId = String(hospitalId || '').trim();
    if (resolvedHospitalId && !mongoose.Types.ObjectId.isValid(resolvedHospitalId)) {
      resolvedHospitalId = '';
    }
    if (!resolvedHospitalId) {
      resolvedHospitalId = doctor.hospitals?.[0]?.hospitalId || '';
    }

    if (!resolvedHospitalId) {
      const fallbackHospitalName = String(doctor.hospitalName || '').trim() || 'AarogyaLink Partner Hospital';
      const fallbackAddress = String(doctor.location || '').trim() || 'Address to be updated';
      const escapedName = fallbackHospitalName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      let fallbackHospital = await Hospital.findOne({ name: new RegExp(`^${escapedName}$`, 'i') });
      if (!fallbackHospital) {
        fallbackHospital = await Hospital.create({
          name: fallbackHospitalName,
          address: fallbackAddress,
          phone: doctor.doctorContactNumber || '',
          departments: [doctor.specialization || 'General Medicine']
        });
      }
      resolvedHospitalId = fallbackHospital._id;
    }

    const selectedHospitalSchedule = getDoctorHospitalSchedule({ doctor, hospitalId: resolvedHospitalId });
    if (!selectedHospitalSchedule) {
      return res.status(400).json({ message: 'Doctor is not assigned to the selected hospital' });
    }

    const { dayName, slots: scheduleSlots } = getScheduleSlotsForDate({
      schedule: selectedHospitalSchedule.schedule || [],
      date
    });
    if (!dayName) {
      return res.status(400).json({ message: 'Invalid appointment date format. Use YYYY-MM-DD.' });
    }
    if (!scheduleSlots.length) {
      return res.status(400).json({ message: `Doctor is not available on ${dayName}` });
    }
    if (!scheduleSlots.includes(timeSlot)) {
      return res.status(400).json({ message: `Selected time slot is not available on ${dayName}` });
    }

    const duplicate = await Appointment.findOne({
      doctorId,
      date,
      timeSlot,
      status: { $ne: 'cancelled' }
    });
    if (duplicate) {
      return res.status(409).json({ message: 'Selected slot is already booked' });
    }

    const created = await Appointment.create({
      patientId: patient._id,
      doctorId,
      hospitalId: resolvedHospitalId,
      date,
      timeSlot,
      notes,
      priority,
      appointmentPrice: Math.max(0, Number(doctor.appointmentPrice ?? 500) || 0),
      paymentStatus: 'paid',
      paymentMethod,
      paymentTransactionId,
      paidAt: new Date(),
      status: 'confirmed'
    });
    const queueData = await addAppointmentToQueue({ appointment: created });

    await createNotification({
      userId: req.user._id,
      type: 'appointment_confirmed',
      message: `Appointment confirmed. Token #${queueData.tokenNumber}.`,
      relatedAppointmentId: created._id
    });

    return res.status(201).json({ appointment: created, queue: queueData });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'Selected slot is already booked' });
    }
    return res.status(500).json({ message: 'Failed to book appointment', error: error.message });
  }
};

const getDoctorEarningsSummary = async (req, res) => {
  try {
    if (req.user.role === 'doctor') {
      const doctorProfile = await getDoctorProfileForUser(req.user._id);
      if (!doctorProfile || String(doctorProfile._id) !== String(req.params.doctorId)) {
        return res.status(403).json({ message: 'Forbidden: doctor can view only own earnings' });
      }
    }

    const paidAppointments = await Appointment.find({
      doctorId: req.params.doctorId,
      paymentStatus: 'paid',
      status: { $ne: 'cancelled' }
    }).select('date appointmentPrice');
    const treatedAppointments = await Appointment.countDocuments({
      doctorId: req.params.doctorId,
      status: 'completed'
    });

    const totalTreatedPatients = treatedAppointments;
    const totalPaidAppointments = paidAppointments.length;
    const totalEarnings = paidAppointments.reduce((sum, item) => sum + Number(item.appointmentPrice || 0), 0);
    const today = new Date().toISOString().slice(0, 10);
    const todaysEarning = paidAppointments
      .filter((item) => String(item.date) === today)
      .reduce((sum, item) => sum + Number(item.appointmentPrice || 0), 0);

    const last7Days = [];
    for (let offset = 6; offset >= 0; offset -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - offset);
      const iso = d.toISOString().slice(0, 10);
      const earning = paidAppointments
        .filter((item) => String(item.date) === iso)
        .reduce((sum, item) => sum + Number(item.appointmentPrice || 0), 0);
      last7Days.push({ date: iso, earning });
    }

    return res.json({
      doctorId: req.params.doctorId,
      totalTreatedPatients,
      totalPaidAppointments,
      totalEarnings,
      todaysEarning,
      last7Days
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch doctor earnings summary', error: error.message });
  }
};

const getDoctorAvailability = async (req, res) => {
  try {
    const { date, hospitalId } = req.query;
    if (!date) {
      return res.status(400).json({ message: 'Date is required in YYYY-MM-DD format' });
    }

    const doctor = await Doctor.findById(req.params.doctorId).populate('hospitals.hospitalId', 'name address');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const hospitalSchedule = getDoctorHospitalSchedule({ doctor, hospitalId });
    if (!hospitalSchedule) {
      return res.status(400).json({ message: 'Doctor is not assigned to the selected hospital' });
    }

    const resolvedHospitalId = hospitalSchedule.hospitalId?._id || hospitalSchedule.hospitalId;
    const { dayName, slots: allSlots } = getScheduleSlotsForDate({
      schedule: hospitalSchedule.schedule || [],
      date
    });
    if (!dayName) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    const dateOverride = getDateAvailabilityOverride({ doctor, date });
    if (dateOverride && !dateOverride.isAvailable) {
      return res.json({
        doctorId: doctor._id,
        hospitalId: resolvedHospitalId,
        hospitalName: hospitalSchedule.hospitalId?.name || doctor.hospitalName || '',
        date,
        day: dayName,
        allSlots,
        bookedSlots: [],
        availableSlots: [],
        isAvailableOnDate: false,
        note: `Doctor is marked unavailable on ${date}`
      });
    }

    const bookedAppointments = await Appointment.find({
      doctorId: doctor._id,
      hospitalId: resolvedHospitalId,
      date,
      status: { $ne: 'cancelled' }
    }).select('timeSlot');

    const bookedSlots = [...new Set(bookedAppointments.map((item) => item.timeSlot).filter(Boolean))];
    const availableSlots = allSlots.filter((slot) => !bookedSlots.includes(slot));

    return res.json({
      doctorId: doctor._id,
      hospitalId: resolvedHospitalId,
      hospitalName: hospitalSchedule.hospitalId?.name || doctor.hospitalName || '',
      date,
      day: dayName,
      allSlots,
      bookedSlots,
      availableSlots,
      isAvailableOnDate: dateOverride ? Boolean(dateOverride.isAvailable) : true,
      note: !availableSlots.length ? 'No available slot for selected date.' : ''
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch doctor availability', error: error.message });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const { date, timeSlot, status, notes } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (!patient || String(patient._id) !== String(appointment.patientId)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }
    if (req.user.role === 'doctor') {
      const doctorProfile = await getDoctorProfileForUser(req.user._id);
      if (!doctorProfile || String(doctorProfile._id) !== String(appointment.doctorId)) {
        return res.status(403).json({ message: 'Forbidden: doctor can update only own appointments' });
      }
    }

    if ((date && date !== appointment.date) || (timeSlot && timeSlot !== appointment.timeSlot)) {
      const clash = await Appointment.findOne({
        _id: { $ne: appointment._id },
        doctorId: appointment.doctorId,
        date: date || appointment.date,
        timeSlot: timeSlot || appointment.timeSlot,
        status: { $ne: 'cancelled' }
      });

      if (clash) return res.status(409).json({ message: 'New time slot is not available' });
    }

    if (date) appointment.date = date;
    if (timeSlot) appointment.timeSlot = timeSlot;
    if (notes !== undefined) appointment.notes = notes;
    if (status === 'cancelled') {
      const result = await cancelAppointmentInQueue({ appointmentId: req.params.id });
      if (appointment.patientId) {
        const patient = await Patient.findById(appointment.patientId).populate('userId');
        if (patient?.userId?._id) {
          await createNotification({
            userId: patient.userId._id,
            type: 'appointment_cancelled',
            message: 'Your appointment has been cancelled.',
            relatedAppointmentId: appointment._id
          });
        }
      }
      return res.json(result.appointment);
    }

    if (status) appointment.status = status;
    await appointment.save();
    return res.json(appointment);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update appointment', error: error.message });
  }
};

const getDoctorAppointmentsToday = async (req, res) => {
  try {
    if (req.user.role === 'doctor') {
      const doctorProfile = await getDoctorProfileForUser(req.user._id);
      if (!doctorProfile || String(doctorProfile._id) !== String(req.params.doctorId)) {
        return res.status(403).json({ message: 'Forbidden: doctor can view only own appointments' });
      }
    }

    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const appointments = await Appointment.find({ doctorId: req.params.doctorId, date })
      .populate({ path: 'patientId', populate: { path: 'userId', select: 'name phone' } })
      .sort({ tokenNumber: 1, createdAt: 1 });

    return res.json(appointments);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch doctor appointments', error: error.message });
  }
};

const getAllAppointmentsAdmin = async (req, res) => {
  try {
    const { status, doctorId, hospitalId, date } = req.query;
    const query = {};
    if (status) query.status = status;
    if (doctorId) query.doctorId = doctorId;
    if (hospitalId) query.hospitalId = hospitalId;
    if (date) query.date = date;

    const appointments = await Appointment.find(query)
      .populate({ path: 'patientId', populate: { path: 'userId', select: 'name phone email' } })
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } })
      .populate('hospitalId', 'name')
      .sort({ createdAt: -1 });

    return res.json(appointments);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch all appointments', error: error.message });
  }
};

module.exports = {
  getPatientAppointments,
  getDoctorAvailability,
  getDoctorEarningsSummary,
  bookAppointment,
  updateAppointment,
  getDoctorAppointmentsToday,
  getAllAppointmentsAdmin
};
