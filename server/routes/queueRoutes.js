const express = require('express');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const {
  getQueueByDoctorDate,
  getPatientQueue,
  nextPatient,
  addWalkInPatient,
  updateQueueStatus,
  resetQueueController
} = require('../controllers/queueController');

const router = express.Router();

router.get('/patient/:appointmentId', auth, roleGuard('patient', 'doctor', 'admin'), getPatientQueue);
router.get('/:doctorId/:date', auth, roleGuard('doctor', 'admin', 'patient'), getQueueByDoctorDate);
router.post('/next/:doctorId', auth, roleGuard('doctor'), nextPatient);
router.post('/walkin', auth, roleGuard('admin'), addWalkInPatient);
router.put('/status/:appointmentId', auth, roleGuard('doctor', 'admin'), updateQueueStatus);
router.post('/reset', auth, roleGuard('admin'), resetQueueController);

module.exports = router;
