const express = require('express');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const { listHospitals, getHospitalById, createHospital, updateHospital } = require('../controllers/hospitalController');

const router = express.Router();

router.get('/', listHospitals);
router.get('/:id', getHospitalById);
router.post('/', auth, roleGuard('admin'), createHospital);
router.put('/:id', auth, roleGuard('admin'), updateHospital);

module.exports = router;
