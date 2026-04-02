const express = require('express');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const {
  getPatientAppointments,
  bookAppointment,
  updateAppointment,
  getDoctorAppointmentsToday,
  getAllAppointmentsAdmin
} = require('../controllers/appointmentController');

const router = express.Router();

router.get('/', auth, roleGuard('patient'), getPatientAppointments);
router.post('/', auth, roleGuard('patient'), bookAppointment);
router.put('/:id', auth, roleGuard('patient', 'doctor', 'admin'), updateAppointment);
router.get('/doctor/:doctorId', auth, roleGuard('doctor', 'admin'), getDoctorAppointmentsToday);
router.get('/admin', auth, roleGuard('admin'), getAllAppointmentsAdmin);

module.exports = router;
