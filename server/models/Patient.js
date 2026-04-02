const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    dateOfBirth: Date,
    gender: { type: String, enum: ['male', 'female', 'other'] },
    medicalHistory: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Patient', patientSchema);
