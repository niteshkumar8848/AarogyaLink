const Notification = require('../models/Notification');
const { getIO } = require('../config/socket');

const createNotification = async ({ userId, type, message, relatedAppointmentId = null }) => {
  const notification = await Notification.create({
    userId,
    type,
    message,
    relatedAppointmentId
  });

  try {
    const io = getIO();
    io.to(`user:${userId}`).emit('notification:new', {
      userId,
      type,
      message,
      relatedAppointmentId,
      createdAt: notification.createdAt
    });
  } catch (error) {
    // Socket may not be initialized in tests. Safe no-op.
  }

  return notification;
};

module.exports = { createNotification };
