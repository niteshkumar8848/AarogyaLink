const express = require('express');
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');
const roleGuard = require('../middleware/roleGuard');
const {
  listDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  updateDoctorApproval,
  markAllDoctorsAvailableToday
} = require('../controllers/doctorController');

const router = express.Router();

router.get('/', optionalAuth, listDoctors);
router.patch('/availability/today/all', auth, roleGuard('admin'), markAllDoctorsAvailableToday);
router.get('/:id', optionalAuth, getDoctorById);
router.post('/', auth, roleGuard('admin'), createDoctor);
router.put('/:id', auth, roleGuard('admin', 'doctor'), updateDoctor);
router.patch('/:id/approval', auth, roleGuard('admin'), updateDoctorApproval);
router.delete('/:id', auth, roleGuard('admin'), deleteDoctor);

module.exports = router;
