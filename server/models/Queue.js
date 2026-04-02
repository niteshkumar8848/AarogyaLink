const mongoose = require('mongoose');

const queueEntrySchema = new mongoose.Schema(
  {
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
    tokenNumber: { type: Number, required: true },
    status: {
      type: String,
      enum: ['waiting', 'called', 'in-progress', 'completed', 'cancelled'],
      default: 'waiting'
    },
    isWalkIn: { type: Boolean, default: false },
    calledAt: Date,
    completedAt: Date
  },
  { _id: false }
);

const queueSchema = new mongoose.Schema(
  {
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    date: { type: String, required: true },
    currentToken: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
    entries: [queueEntrySchema]
  },
  { timestamps: true }
);

queueSchema.index({ doctorId: 1, hospitalId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Queue', queueSchema);
