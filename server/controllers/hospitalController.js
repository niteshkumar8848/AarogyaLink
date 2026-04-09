const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');

const normalizeId = (value) => String(value?._id || value || '');

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

const deleteHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });

    const doctors = await Doctor.find({ 'hospitals.hospitalId': hospital._id });

    await Promise.all(
      doctors.map(async (doctor) => {
        const filteredHospitals = (doctor.hospitals || []).filter(
          (item) => normalizeId(item?.hospitalId) !== normalizeId(hospital._id)
        );

        doctor.hospitals = filteredHospitals;

        const primaryHospitalId = filteredHospitals[0]?.hospitalId;
        if (!primaryHospitalId) {
          doctor.hospitalName = '';
          doctor.location = '';
          await doctor.save();
          return;
        }

        const primaryHospital = await Hospital.findById(primaryHospitalId).select('name address');
        doctor.hospitalName = primaryHospital?.name || '';
        doctor.location = primaryHospital?.address || '';
        await doctor.save();
      })
    );

    await Hospital.findByIdAndDelete(hospital._id);

    return res.json({
      message: 'Hospital removed successfully',
      removedHospitalId: hospital._id,
      doctorsUpdated: doctors.length
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete hospital', error: error.message });
  }
};

module.exports = {
  listHospitals,
  getHospitalById,
  createHospital,
  updateHospital,
  deleteHospital
};
