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

const getRevenueReport = async () => {
  const paidMatch = { paymentStatus: 'paid', status: { $ne: 'cancelled' } };

  const [overviewAgg = { totalRevenue: 0, totalPaidAppointments: 0 }, byDoctor = [], daily = []] = await Promise.all([
    Appointment.aggregate([
      { $match: paidMatch },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$appointmentPrice' },
          totalPaidAppointments: { $sum: 1 }
        }
      },
      { $project: { _id: 0, totalRevenue: 1, totalPaidAppointments: 1 } }
    ]).then((rows) => rows[0]),
    Appointment.aggregate([
      { $match: paidMatch },
      {
        $group: {
          _id: '$doctorId',
          revenue: { $sum: '$appointmentPrice' },
          appointments: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'doctors',
          localField: '_id',
          foreignField: '_id',
          as: 'doctor'
        }
      },
      { $unwind: { path: '$doctor', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'doctor.userId',
          foreignField: '_id',
          as: 'doctorUser'
        }
      },
      { $unwind: { path: '$doctorUser', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          doctorId: '$_id',
          doctorName: '$doctorUser.name',
          specialization: '$doctor.specialization',
          revenue: 1,
          appointments: 1
        }
      },
      { $sort: { revenue: -1 } }
    ]),
    Appointment.aggregate([
      { $match: paidMatch },
      {
        $group: {
          _id: '$date',
          revenue: { $sum: '$appointmentPrice' },
          appointments: { $sum: 1 }
        }
      },
      { $project: { _id: 0, date: '$_id', revenue: 1, appointments: 1 } },
      { $sort: { date: 1 } }
    ])
  ]);

  return {
    overview: overviewAgg,
    byDoctor,
    daily
  };
};

module.exports = {
  getFlowReport,
  getConsultationStats,
  getQueueMetrics,
  getRevenueReport
};
