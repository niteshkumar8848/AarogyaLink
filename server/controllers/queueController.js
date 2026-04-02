const Queue = require('../models/Queue');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const {
  getPatientQueueStatus,
  callNextPatient,
  completeAppointmentInQueue,
  addWalkIn,
  resetQueue
} = require('../services/queueService');

const getDoctorProfileForUser = async (userId) => Doctor.findOne({ userId }).select('_id');

const getQueueByDoctorDate = async (req, res) => {
  try {
    if (req.user.role === 'doctor') {
      const doctorProfile = await getDoctorProfileForUser(req.user._id);
      if (!doctorProfile || String(doctorProfile._id) !== String(req.params.doctorId)) {
        return res.status(403).json({ message: 'Forbidden: doctor can view only own queue' });
      }
    }

    const queue = await Queue.findOne({ doctorId: req.params.doctorId, date: req.params.date })
      .populate('entries.appointmentId');
    if (!queue) return res.json({ currentToken: 0, totalTokens: 0, entries: [] });

    return res.json(queue);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch queue', error: error.message });
  }
};

const getPatientQueue = async (req, res) => {
  try {
    const status = await getPatientQueueStatus(req.params.appointmentId);
    return res.json(status);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch patient queue status', error: error.message });
  }
};

const nextPatient = async (req, res) => {
  try {
    const doctorProfile = await getDoctorProfileForUser(req.user._id);
    if (!doctorProfile || String(doctorProfile._id) !== String(req.params.doctorId)) {
      return res.status(403).json({ message: 'Forbidden: doctor can manage only own queue' });
    }

    const { hospitalId, date } = req.body;
    const result = await callNextPatient({ doctorId: req.params.doctorId, hospitalId, date });
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to call next patient', error: error.message });
  }
};

const updateQueueStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.appointmentId);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    if (req.user.role === 'doctor') {
      const doctorProfile = await getDoctorProfileForUser(req.user._id);
      if (!doctorProfile || String(doctorProfile._id) !== String(appointment.doctorId)) {
        return res.status(403).json({ message: 'Forbidden: doctor can update only own queue entries' });
      }
    }

    if (status === 'completed') {
      const result = await completeAppointmentInQueue({ appointmentId: req.params.appointmentId });
      return res.json(result);
    }

    appointment.status = status;
    await appointment.save();
    return res.json(appointment);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update queue status', error: error.message });
  }
};

const addWalkInPatient = async (req, res) => {
  try {
    const { doctorId, hospitalId, date } = req.body;
    const result = await addWalkIn({ doctorId, hospitalId, date });
    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to add walk-in patient', error: error.message });
  }
};

const resetQueueController = async (req, res) => {
  try {
    const { doctorId, hospitalId, date } = req.body;
    const queue = await resetQueue({ doctorId, hospitalId, date });
    return res.json({ message: queue ? 'Queue reset' : 'Queue not found', queue });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to reset queue', error: error.message });
  }
};

module.exports = {
  getQueueByDoctorDate,
  getPatientQueue,
  nextPatient,
  addWalkInPatient,
  updateQueueStatus,
  resetQueueController
};
