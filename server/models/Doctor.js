const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema(
  {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isBooked: { type: Boolean, default: false }
  },
  { _id: false }
);

const dayScheduleSchema = new mongoose.Schema(
  {
    day: { type: String, required: true },
    slots: [slotSchema]
  },
  { _id: false }
);

const doctorHospitalSchema = new mongoose.Schema(
  {
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    schedule: [dayScheduleSchema]
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    specialization: { type: String, required: true },
    hospitalName: { type: String, default: '', trim: true },
    location: { type: String, default: '', trim: true },
    doctorContactNumber: { type: String, default: '', trim: true },
    qualifications: { type: String },
    experience: { type: Number, default: 0 },
    hospitals: [doctorHospitalSchema],
    isAvailableToday: { type: Boolean, default: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true
    },
    approvedAt: Date,
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);
