const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    date: { type: String, required: true },
    timeSlot: { type: String, required: true },
    tokenNumber: { type: Number },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
      default: 'confirmed'
    },
    priority: { type: String, enum: ['normal', 'emergency'], default: 'normal' },
    queuePosition: { type: Number, default: 0 },
    estimatedWaitTime: { type: Number, default: 0 },
    appointmentPrice: { type: Number, default: 0, min: 0 },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending'
    },
    paymentMethod: {
      type: String,
      enum: ['esewa', 'khalti', 'mobile_banking']
    },
    paymentTransactionId: { type: String, default: '' },
    paidAt: Date,
    notes: String,
    calledAt: Date,
    completedAt: Date
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

appointmentSchema.index({ doctorId: 1, date: 1, timeSlot: 1 }, { unique: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
