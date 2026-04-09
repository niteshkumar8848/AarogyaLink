const express = require('express');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const {
  getPatientAppointments,
  getDoctorAvailability,
  getDoctorEarningsSummary,
  bookAppointment,
  updateAppointment,
  getDoctorAppointmentsToday,
  getAllAppointmentsAdmin
} = require('../controllers/appointmentController');

const router = express.Router();

router.get('/', auth, roleGuard('patient'), getPatientAppointments);
router.get('/availability/:doctorId', auth, roleGuard('patient'), getDoctorAvailability);
router.post('/', auth, roleGuard('patient'), bookAppointment);
router.put('/:id', auth, roleGuard('patient', 'doctor', 'admin'), updateAppointment);
router.get('/doctor/:doctorId/earnings', auth, roleGuard('doctor', 'admin'), getDoctorEarningsSummary);
router.get('/doctor/:doctorId', auth, roleGuard('doctor', 'admin'), getDoctorAppointmentsToday);
router.get('/admin', auth, roleGuard('admin'), getAllAppointmentsAdmin);

module.exports = router;
