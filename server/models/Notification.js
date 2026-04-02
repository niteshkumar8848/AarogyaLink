const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    relatedAppointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
