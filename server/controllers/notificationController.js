const Notification = require('../models/Notification');

const listNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    return res.json({ unreadCount, notifications });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
  }
};

const markRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    return res.json(notification);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to mark notification read', error: error.message });
  }
};

const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
    return res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to mark all notifications read', error: error.message });
  }
};

module.exports = {
  listNotifications,
  markRead,
  markAllRead
};
