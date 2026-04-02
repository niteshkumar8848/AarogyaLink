const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');

const listHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find().sort({ name: 1 });
    return res.json(hospitals);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch hospitals', error: error.message });
  }
};

const getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });

    const doctors = await Doctor.find({ 'hospitals.hospitalId': hospital._id })
      .populate('userId', 'name email phone')
      .select('specialization qualifications experience isAvailableToday userId');

    return res.json({ ...hospital.toObject(), doctors });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch hospital', error: error.message });
  }
};

const createHospital = async (req, res) => {
  try {
    const hospital = await Hospital.create(req.body);
    return res.status(201).json(hospital);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create hospital', error: error.message });
  }
};

const updateHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });
    return res.json(hospital);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update hospital', error: error.message });
  }
};

module.exports = {
  listHospitals,
  getHospitalById,
  createHospital,
  updateHospital
};
