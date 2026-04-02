const Appointment = require('../models/Appointment');

const getFlowReport = async ({ startDate, endDate }) => {
  const match = {};
  if (startDate || endDate) {
    match.date = {};
    if (startDate) match.date.$gte = startDate;
    if (endDate) match.date.$lte = endDate;
  }

  return Appointment.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$date',
        total: { $sum: 1 },
        completed: {
          $sum: {
            $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
          }
        },
        cancelled: {
          $sum: {
            $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0]
          }
        }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

const getConsultationStats = async () => {
  return Appointment.aggregate([
    {
      $group: {
        _id: '$doctorId',
        totalConsultations: { $sum: 1 },
        completedConsultations: {
          $sum: {
            $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
          }
        }
      }
    }
  ]);
};

const getQueueMetrics = async () => {
  const completed = await Appointment.find({ status: 'completed', calledAt: { $ne: null }, completedAt: { $ne: null } });

  if (!completed.length) {
    return { averageServiceTimeMinutes: 15, sampleSize: 0 };
  }

  const totalMs = completed.reduce((sum, item) => {
    return sum + (new Date(item.completedAt).getTime() - new Date(item.calledAt).getTime());
  }, 0);

  return {
    averageServiceTimeMinutes: Number((totalMs / completed.length / 60000).toFixed(2)),
    sampleSize: completed.length
  };
};

module.exports = {
  getFlowReport,
  getConsultationStats,
  getQueueMetrics
};
