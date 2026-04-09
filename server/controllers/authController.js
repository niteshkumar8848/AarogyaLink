const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const { signAccessToken, signRefreshToken } = require('../utils/tokenUtils');

const createHttpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};
const normalizeId = (value) => String(value?._id || value || '');

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

const registerPatient = async (req, res) => {
  try {
    const { name, email, password, phone, dateOfBirth, gender } = req.body;

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: 'patient',
      phone
    });

    await Patient.create({ userId: user._id, dateOfBirth, gender });

    const payload = { id: user._id, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    return res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        profilePhoto: user.profilePhoto || ''
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

const registerDoctor = async (req, res) => {
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
      appointmentPrice
    } = req.body;

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: 'doctor',
      phone
    });

    const createdDoctor = await Doctor.create({
      userId: user._id,
      specialization: specialization || 'General Medicine',
      hospitalName: '',
      location: '',
      doctorContactNumber: doctorContactNumber || phone || '',
      qualifications: qualifications || '',
      experience: Number(experience || 0),
      appointmentPrice: Math.max(0, Number(appointmentPrice ?? 500) || 0),
      hospitals: [],
      isAvailableToday: false,
      approvalStatus: 'pending'
    });

    await syncDoctorPrimaryHospital({ doctor: createdDoctor, hospitalId });
    await createdDoctor.save();

    return res.status(201).json({
      message: 'Doctor registration submitted. Please wait for admin approval before login.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ message: 'Doctor registration failed', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    if (user.role === 'doctor') {
      const doctorProfile = await Doctor.findOne({ userId: user._id }).select('approvalStatus');
      if (!doctorProfile) {
        return res.status(403).json({ message: 'Doctor profile not found. Contact admin.' });
      }
      if (doctorProfile.approvalStatus !== 'approved') {
        return res.status(403).json({
          message: `Doctor account is ${doctorProfile.approvalStatus}. Admin approval is required before login.`
        });
      }
    }

    const payload = { id: user._id, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    return res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        profilePhoto: user.profilePhoto || ''
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'Missing refresh token' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'Invalid refresh token' });

    const accessToken = signAccessToken({ id: user._id, role: user.role });
    return res.json({ accessToken });
  } catch (error) {
    return res.status(401).json({ message: 'Refresh failed', error: error.message });
  }
};

const getRoleProfile = async (user) => {
  if (user.role === 'patient') {
    return Patient.findOne({ userId: user._id });
  }

  if (user.role === 'doctor') {
    return Doctor.findOne({ userId: user._id }).populate('hospitals.hospitalId', 'name address');
  }

  return null;
};

const me = async (req, res) => {
  const roleProfile = await getRoleProfile(req.user);
  return res.json({ user: req.user, roleProfile });
};

const updateMe = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      profilePhoto,
      dateOfBirth,
      gender,
      medicalHistory,
      specialization,
      hospitalId,
      doctorContactNumber,
      qualifications,
      experience,
      appointmentPrice,
      isAvailableToday
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (email && email.toLowerCase() !== user.email) {
      const existing = await User.findOne({ email: email.toLowerCase(), _id: { $ne: user._id } });
      if (existing) return res.status(409).json({ message: 'Email already in use' });
      user.email = email.toLowerCase();
    }

    if (typeof name === 'string' && name.trim()) user.name = name.trim();
    if (typeof phone === 'string') user.phone = phone.trim();

    if (profilePhoto !== undefined) {
      if (profilePhoto === null || profilePhoto === '') {
        user.profilePhoto = '';
      } else {
        const isValidDataUrl = typeof profilePhoto === 'string' && /^data:image\/(png|jpe?g|webp);base64,/i.test(profilePhoto);
        if (!isValidDataUrl) {
          return res.status(400).json({ message: 'Profile photo must be a base64 data URL (png/jpeg/webp)' });
        }
        if (profilePhoto.length > 2_800_000) {
          return res.status(400).json({ message: 'Profile photo too large. Keep it below ~2MB.' });
        }
        user.profilePhoto = profilePhoto;
      }
    }

    if (password) {
      if (String(password).length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      user.passwordHash = await bcrypt.hash(password, 10);
    }

    await user.save();

    if (user.role === 'patient') {
      const patient = await Patient.findOne({ userId: user._id });
      if (patient) {
        if (dateOfBirth !== undefined) patient.dateOfBirth = dateOfBirth || null;
        if (gender !== undefined) patient.gender = gender || null;
        if (medicalHistory !== undefined) patient.medicalHistory = medicalHistory || '';
        await patient.save();
      }
    }

    if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: user._id });
      if (doctor) {
        if (specialization !== undefined) doctor.specialization = specialization;
        if (doctorContactNumber !== undefined) doctor.doctorContactNumber = doctorContactNumber;
        if (qualifications !== undefined) doctor.qualifications = qualifications;
        if (experience !== undefined) doctor.experience = experience;
        if (appointmentPrice !== undefined) doctor.appointmentPrice = Math.max(0, Number(appointmentPrice) || 0);
        if (isAvailableToday !== undefined) doctor.isAvailableToday = Boolean(isAvailableToday);
        await syncDoctorPrimaryHospital({ doctor, hospitalId });
        await doctor.save();
      }
    }

    const freshUser = await User.findById(user._id).select('-passwordHash');
    const roleProfile = await getRoleProfile(freshUser);
    return res.json({ user: freshUser, roleProfile });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ message: 'Failed to update profile', error: error.message });
  }
};

module.exports = {
  registerPatient,
  registerDoctor,
  login,
  refresh,
  me,
  updateMe
};
