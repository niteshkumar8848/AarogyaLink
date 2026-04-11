const bcrypt = require('bcryptjs');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Hospital = require('../models/Hospital');

const createHttpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};
const normalizeId = (value) => String(value?._id || value || '');

const sanitizeDateAvailability = (entries = []) => {
  const map = new Map();
  for (const item of entries || []) {
    const date = String(item?.date || '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    map.set(date, { date, isAvailable: Boolean(item?.isAvailable) });
  }
  return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
};

const syncDoctorPrimaryHospital = async ({ doctor, hospitalId }) => {
  if (hospitalId === undefined) return;
  if (!hospitalId) {
    doctor.hospitalName = '';
    doctor.location = '';
    return;
  }

  const hospital = await Hospital.findById(hospitalId);
  if (!hospital) {
    throw createHttpError(400, 'Selected hospital is not available. Choose a registered hospital.');
  }

  const list = Array.isArray(doctor.hospitals) ? [...doctor.hospitals] : [];
  const existingIndex = list.findIndex((item) => normalizeId(item?.hospitalId) === normalizeId(hospital._id));
  if (existingIndex >= 0) {
    const [existing] = list.splice(existingIndex, 1);
    doctor.hospitals = [existing, ...list];
  } else {
    doctor.hospitals = [{ hospitalId: hospital._id, schedule: [] }, ...list];
  }

  doctor.hospitalName = hospital.name || '';
  doctor.location = hospital.address || '';
};

const listDoctors = async (req, res) => {
  try {
    const { specialty, hospital, availability, doctorName, hospitalName, place } = req.query;

    const doctorFilter = {};
    if (availability !== undefined) doctorFilter.isAvailableToday = availability === 'true';
    if (specialty) doctorFilter.specialization = new RegExp(specialty, 'i');
    if (hospital) doctorFilter['hospitals.hospitalId'] = hospital;
    if (!req.user || req.user.role !== 'admin') doctorFilter.approvalStatus = 'approved';

    const doctors = await Doctor.find(doctorFilter)
      .populate('userId', 'name email phone profilePhoto')
      .populate('hospitals.hospitalId', 'name address departments');

    const norm = (value) => String(value || '').toLowerCase().trim();
    const nameFilter = norm(doctorName);
    const hospitalNameFilter = norm(hospitalName);
    const placeFilter = norm(place);

    const filtered = doctors.filter((doctor) => {
      if (nameFilter) {
        const doctorUserName = norm(doctor.userId?.name);
        if (!doctorUserName.includes(nameFilter)) return false;
      }

      if (hospitalNameFilter) {
        const doctorPrimaryHospital = norm(doctor.hospitalName);
        const mappedHospitalName = (doctor.hospitals || []).some((item) =>
          norm(item?.hospitalId?.name).includes(hospitalNameFilter)
        );
        if (!doctorPrimaryHospital.includes(hospitalNameFilter) && !mappedHospitalName) return false;
      }

      if (placeFilter) {
        const doctorLocation = norm(doctor.location);
        const mappedHospitalLocation = (doctor.hospitals || []).some((item) =>
          norm(item?.hospitalId?.address).includes(placeFilter)
        );
        if (!doctorLocation.includes(placeFilter) && !mappedHospitalLocation) return false;
      }

      return true;
    });

    return res.json(filtered);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch doctors', error: error.message });
  }
};

const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('userId', 'name email phone profilePhoto')
      .populate('hospitals.hospitalId', 'name address departments');

    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    if ((!req.user || req.user.role !== 'admin') && doctor.approvalStatus !== 'approved') {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    return res.json(doctor);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch doctor', error: error.message });
  }
};

const createDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      specialization,
      hospitalId,
      doctorContactNumber,
      qualifications,
      experience,
      appointmentPrice,
      hospitals,
      dateAvailability,
      isAvailableToday
    } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: 'Email already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: 'doctor',
      phone
    });

    const doctor = await Doctor.create({
      userId: user._id,
      specialization,
      hospitalName: '',
      location: '',
      doctorContactNumber: doctorContactNumber || phone || '',
      qualifications,
      experience,
      appointmentPrice: Number(appointmentPrice ?? 500),
      hospitals: hospitals || [],
      dateAvailability: sanitizeDateAvailability(dateAvailability || []),
      isAvailableToday: isAvailableToday ?? true,
      approvalStatus: 'approved',
      approvedAt: new Date(),
      approvedBy: req.user._id
    });
    await syncDoctorPrimaryHospital({ doctor, hospitalId });
    await doctor.save();

    return res.status(201).json(doctor);
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ message: 'Failed to create doctor', error: error.message });
  }
};

const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    if (req.user.role === 'doctor' && String(doctor.userId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Doctors can update only their own profile' });
    }

    const doctorUser = await User.findById(doctor.userId);
    if (!doctorUser) return res.status(404).json({ message: 'Doctor user not found' });

    const updates = { ...req.body };
    if (req.user.role === 'doctor') {
      delete updates.approvalStatus;
      delete updates.approvedAt;
      delete updates.approvedBy;
      delete updates.rejectionReason;
    }

    const {
      name,
      email,
      phone,
      password,
      profilePhoto,
      specialization,
      hospitalId,
      doctorContactNumber,
      qualifications,
      experience,
      appointmentPrice,
      hospitals,
      dateAvailability,
      isAvailableToday
    } = updates;

    if (name !== undefined) doctorUser.name = String(name).trim();
    if (phone !== undefined) doctorUser.phone = String(phone || '').trim();

    if (email !== undefined) {
      const normalized = String(email).toLowerCase().trim();
      const existing = await User.findOne({ email: normalized, _id: { $ne: doctorUser._id } });
      if (existing) return res.status(409).json({ message: 'Email already in use' });
      doctorUser.email = normalized;
    }

    if (password !== undefined && password !== '') {
      if (String(password).length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      doctorUser.passwordHash = await bcrypt.hash(String(password), 10);
    }

    if (profilePhoto !== undefined) {
      if (profilePhoto === null || profilePhoto === '') {
        doctorUser.profilePhoto = '';
      } else {
        const isValidDataUrl =
          typeof profilePhoto === 'string' && /^data:image\/(png|jpe?g|webp);base64,/i.test(profilePhoto);
        if (!isValidDataUrl) {
          return res.status(400).json({ message: 'Profile photo must be a base64 data URL (png/jpeg/webp)' });
        }
        doctorUser.profilePhoto = profilePhoto;
      }
    }

    await doctorUser.save();

    if (specialization !== undefined) doctor.specialization = specialization;
    if (doctorContactNumber !== undefined) doctor.doctorContactNumber = doctorContactNumber;
    if (qualifications !== undefined) doctor.qualifications = qualifications;
    if (experience !== undefined) doctor.experience = experience;
    if (appointmentPrice !== undefined) doctor.appointmentPrice = Math.max(0, Number(appointmentPrice) || 0);
    if (hospitals !== undefined) doctor.hospitals = hospitals;
    if (dateAvailability !== undefined) doctor.dateAvailability = sanitizeDateAvailability(dateAvailability);
    if (isAvailableToday !== undefined) doctor.isAvailableToday = Boolean(isAvailableToday);

    if (req.user.role === 'admin' && updates.approvalStatus !== undefined) {
      doctor.approvalStatus = updates.approvalStatus;
      doctor.approvedAt = updates.approvedAt || doctor.approvedAt;
      doctor.approvedBy = updates.approvedBy || doctor.approvedBy;
      doctor.rejectionReason = updates.rejectionReason || doctor.rejectionReason;
    }
    await syncDoctorPrimaryHospital({ doctor, hospitalId });
    await doctor.save();

    const enriched = await Doctor.findById(doctor._id)
      .populate('userId', 'name email phone profilePhoto')
      .populate('hospitals.hospitalId', 'name address departments');
    return res.json(enriched);
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ message: 'Failed to update doctor', error: error.message });
  }
};

const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    await User.deleteOne({ _id: doctor.userId });
    await doctor.deleteOne();

    return res.json({ message: 'Doctor removed' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete doctor', error: error.message });
  }
};

const updateDoctorApproval = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    doctor.approvalStatus = status;
    doctor.approvedBy = req.user._id;
    doctor.approvedAt = status === 'approved' ? new Date() : null;
    doctor.rejectionReason = status === 'rejected' ? String(rejectionReason || '') : '';
    if (status === 'rejected') doctor.isAvailableToday = false;
    await doctor.save();

    return res.json(doctor);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update doctor approval status', error: error.message });
  }
};

const markAllDoctorsAvailableToday = async (req, res) => {
  try {
    const result = await Doctor.updateMany({}, { $set: { isAvailableToday: true } });
    return res.json({
      message: 'All doctors marked as available today',
      matchedCount: result.matchedCount || 0,
      modifiedCount: result.modifiedCount || 0
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update doctor availability', error: error.message });
  }
};

module.exports = {
  listDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  updateDoctorApproval,
  markAllDoctorsAvailableToday
};
