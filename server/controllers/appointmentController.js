const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Hospital = require('../models/Hospital');
const { addAppointmentToQueue } = require('../services/queueService');
const { createNotification } = require('../services/notificationService');

const getDoctorProfileForUser = async (userId) => Doctor.findOne({ userId }).select('_id');

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
    const { doctorId, hospitalId, date, timeSlot, notes, priority = 'normal' } = req.body;

    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    const duplicate = await Appointment.findOne({ doctorId, date, timeSlot, status: { $ne: 'cancelled' } });
    if (duplicate) {
      return res.status(409).json({ message: 'Selected slot is already booked' });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
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

    const doctorHasHospitalMapping = (doctor.hospitals || []).some(
      (item) => String(item.hospitalId) === String(resolvedHospitalId)
    );
    if (!doctorHasHospitalMapping) {
      doctor.hospitals.push({ hospitalId: resolvedHospitalId, schedule: [] });
      await doctor.save();
    }

    const created = await Appointment.create({
      patientId: patient._id,
      doctorId,
      hospitalId: resolvedHospitalId,
      date,
      timeSlot,
      notes,
      priority,
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
    if (status) appointment.status = status;
    if (notes !== undefined) appointment.notes = notes;

    await appointment.save();

    if (status === 'cancelled' && appointment.patientId) {
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
  bookAppointment,
  updateAppointment,
  getDoctorAppointmentsToday,
  getAllAppointmentsAdmin
};
