const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');

const buildDefaultSchedule = () => [
  {
    day: 'Monday',
    slots: [
      { startTime: '09:00', endTime: '09:30' },
      { startTime: '09:30', endTime: '10:00' }
    ]
  },
  {
    day: 'Wednesday',
    slots: [
      { startTime: '11:00', endTime: '11:30' },
      { startTime: '11:30', endTime: '12:00' }
    ]
  },
  {
    day: 'Friday',
    slots: [
      { startTime: '14:00', endTime: '14:30' },
      { startTime: '14:30', endTime: '15:00' }
    ]
  }
];

const getOrCreateDefaultHospital = async () => {
  const name = process.env.DEFAULT_HOSPITAL_NAME || 'City Hospital Kathmandu';
  let hospital = await Hospital.findOne({ name });

  if (!hospital) {
    hospital = await Hospital.create({
      name,
      address: process.env.DEFAULT_HOSPITAL_ADDRESS || 'Kathmandu, Nepal',
      phone: process.env.DEFAULT_HOSPITAL_PHONE || '+977-1-4000000',
      email: process.env.DEFAULT_HOSPITAL_EMAIL || 'contact@aarogyalink.com',
      departments: ['General Medicine', 'Cardiology', 'Pediatrics']
    });
    console.log(`[bootstrap] Created default hospital: ${hospital.name}`);
  }

  return hospital;
};

const ensureDefaultAdmin = async () => {
  const email = (process.env.DEFAULT_ADMIN_EMAIL || 'admin@aarogyalink.com').toLowerCase();
  const password = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123';
  const name = process.env.DEFAULT_ADMIN_NAME || 'System Admin';

  let admin = await User.findOne({ email });
  if (!admin) {
    const passwordHash = await bcrypt.hash(password, 10);
    admin = await User.create({
      name,
      email,
      passwordHash,
      role: 'admin',
      phone: process.env.DEFAULT_ADMIN_PHONE || '+977-9800000001'
    });
    console.log(`[bootstrap] Created default admin: ${email}`);
  }

  console.log(`[credentials] Admin -> email: ${email}, password: ${password}`);
  return admin;
};

const ensureDefaultDoctor = async () => {
  const email = (process.env.DEFAULT_DOCTOR_EMAIL || 'doctor@aarogyalink.com').toLowerCase();
  const password = process.env.DEFAULT_DOCTOR_PASSWORD || 'Doctor@123';
  const name = process.env.DEFAULT_DOCTOR_NAME || 'Dr. Demo';

  let doctorUser = await User.findOne({ email });
  if (!doctorUser) {
    const passwordHash = await bcrypt.hash(password, 10);
    doctorUser = await User.create({
      name,
      email,
      passwordHash,
      role: 'doctor',
      phone: process.env.DEFAULT_DOCTOR_PHONE || '+977-9800000002'
    });
    console.log(`[bootstrap] Created default doctor user: ${email}`);
  }

  const hospital = await getOrCreateDefaultHospital();

  let doctorProfile = await Doctor.findOne({ userId: doctorUser._id });
  if (!doctorProfile) {
    doctorProfile = await Doctor.create({
      userId: doctorUser._id,
      specialization: process.env.DEFAULT_DOCTOR_SPECIALIZATION || 'General Medicine',
      qualifications: process.env.DEFAULT_DOCTOR_QUALIFICATIONS || 'MBBS',
      experience: Number(process.env.DEFAULT_DOCTOR_EXPERIENCE || 5),
      hospitals: [
        {
          hospitalId: hospital._id,
          schedule: buildDefaultSchedule()
        }
      ],
      isAvailableToday: true,
      rating: 4.5,
      approvalStatus: 'approved',
      approvedAt: new Date()
    });
    console.log(`[bootstrap] Created default doctor profile for: ${email}`);
  }

  console.log(`[credentials] Doctor -> email: ${email}, password: ${password}`);
  return { doctorUser, doctorProfile };
};

const seedDefaultAccounts = async () => {
  await Doctor.updateMany(
    { approvalStatus: { $exists: false } },
    { $set: { approvalStatus: 'approved', approvedAt: new Date() } }
  );
  await ensureDefaultAdmin();
  await ensureDefaultDoctor();
};

module.exports = {
  seedDefaultAccounts
};
