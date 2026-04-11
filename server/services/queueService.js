const Appointment = require('../models/Appointment');
const Queue = require('../models/Queue');
const { getIO } = require('../config/socket');
const { createNotification } = require('./notificationService');
const Patient = require('../models/Patient');
const User = require('../models/User');

const DEFAULT_AVERAGE_MINUTES = 15;

const getMinutesUntilSlotStart = ({ date, timeSlot, now = new Date() }) => {
  const day = String(date || '').trim();
  const start = String(timeSlot || '').split('-')[0]?.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !/^\d{2}:\d{2}$/.test(start || '')) return 0;

  const [hour, minute] = start.split(':').map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return 0;

  const slotStart = new Date(now);
  slotStart.setSeconds(0, 0);
  slotStart.setFullYear(Number(day.slice(0, 4)));
  slotStart.setMonth(Number(day.slice(5, 7)) - 1);
  slotStart.setDate(Number(day.slice(8, 10)));
  slotStart.setHours(hour, minute, 0, 0);

  const diffMinutes = Math.ceil((slotStart.getTime() - now.getTime()) / 60000);
  return Math.max(0, diffMinutes);
};

const getAverageConsultationMinutes = async (doctorId) => {
  const recent = await Appointment.find({
    doctorId,
    status: 'completed',
    calledAt: { $ne: null },
    completedAt: { $ne: null }
  })
    .sort({ completedAt: -1 })
    .limit(10);

  if (!recent.length) return DEFAULT_AVERAGE_MINUTES;

  const total = recent.reduce((sum, appointment) => {
    const duration = new Date(appointment.completedAt).getTime() - new Date(appointment.calledAt).getTime();
    return sum + duration;
  }, 0);

  return Math.max(1, Math.round(total / recent.length / 60000));
};

const getOrCreateQueue = async ({ doctorId, hospitalId, date }) => {
  let queue = await Queue.findOne({ doctorId, hospitalId, date });

  if (!queue) {
    queue = await Queue.create({
      doctorId,
      hospitalId,
      date,
      currentToken: 0,
      totalTokens: 0,
      entries: []
    });
  }

  return queue;
};

const emitQueueUpdate = async (queue) => {
  let io;
  try {
    io = getIO();
  } catch {
    return;
  }

  const waitingEntries = queue.entries.filter((entry) => ['waiting', 'called', 'in-progress'].includes(entry.status));
  io.to(`doctor:${queue.doctorId}`).emit('queue:updated', {
    doctorId: queue.doctorId,
    currentToken: queue.currentToken,
    totalWaiting: waitingEntries.length,
    estimatedWait: null
  });
};

const addAppointmentToQueue = async ({ appointment, isWalkIn = false }) => {
  const queue = await getOrCreateQueue({
    doctorId: appointment.doctorId,
    hospitalId: appointment.hospitalId,
    date: appointment.date
  });

  const tokenNumber = queue.totalTokens + 1;
  queue.totalTokens = tokenNumber;
  queue.entries.push({
    appointmentId: appointment._id,
    tokenNumber,
    status: 'waiting',
    isWalkIn
  });
  await queue.save();

  const waitingBeforeMe = queue.entries.filter((entry) => entry.tokenNumber < tokenNumber && ['waiting', 'called', 'in-progress'].includes(entry.status)).length;
  const avgMinutes = await getAverageConsultationMinutes(appointment.doctorId);
  const estimatedWaitTime = waitingBeforeMe * avgMinutes;

  appointment.tokenNumber = tokenNumber;
  appointment.queuePosition = waitingBeforeMe + 1;
  appointment.estimatedWaitTime = estimatedWaitTime;
  await appointment.save();

  await emitQueueUpdate(queue);

  return {
    queue,
    tokenNumber,
    queuePosition: waitingBeforeMe + 1,
    estimatedWaitTime
  };
};

const getPatientQueueStatus = async (appointmentId) => {
  const appointment = await Appointment.findById(appointmentId)
    .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name profilePhoto' } })
    .populate('hospitalId', 'name address');
  if (!appointment) throw new Error('Appointment not found');

  const doctorProfile = appointment.doctorId;
  const doctorUser = doctorProfile?.userId;
  const hospital = appointment.hospitalId;

  const details = {
    appointmentId: appointment._id,
    doctorId: doctorProfile?._id || appointment.doctorId,
    doctorName: doctorUser?.name || 'Doctor',
    doctorPhoto: doctorUser?.profilePhoto || '',
    specialization: doctorProfile?.specialization || '',
    hospitalName: hospital?.name || '',
    hospitalAddress: hospital?.address || '',
    date: appointment.date,
    timeSlot: appointment.timeSlot,
    appointmentStatus: appointment.status
  };

  const queue = await Queue.findOne({
    doctorId: doctorProfile?._id || appointment.doctorId,
    hospitalId: hospital?._id || appointment.hospitalId,
    date: appointment.date
  });

  if (!queue) {
    const timeBasedWait = getMinutesUntilSlotStart({ date: appointment.date, timeSlot: appointment.timeSlot });
    return {
      ...details,
      currentToken: 0,
      tokenNumber: appointment.tokenNumber,
      queuePosition: 0,
      estimatedWaitTime: timeBasedWait
    };
  }

  const myEntry = queue.entries.find((entry) => String(entry.appointmentId) === String(appointmentId));
  const ahead = queue.entries.filter(
    (entry) =>
      entry.tokenNumber < (myEntry?.tokenNumber || appointment.tokenNumber || 0) &&
      ['waiting', 'called', 'in-progress'].includes(entry.status)
  );

  const avgMinutes = await getAverageConsultationMinutes(appointment.doctorId);
  const queuePosition = ahead.length + 1;
  const queueBasedWait = ahead.length * avgMinutes;
  const timeBasedWait = getMinutesUntilSlotStart({ date: appointment.date, timeSlot: appointment.timeSlot });
  const estimatedWaitTime = Math.max(queueBasedWait, timeBasedWait);

  return {
    ...details,
    currentToken: queue.currentToken,
    tokenNumber: myEntry?.tokenNumber || appointment.tokenNumber,
    queuePosition,
    estimatedWaitTime,
    totalTokens: queue.totalTokens
  };
};

const callNextPatient = async ({ doctorId, hospitalId, date }) => {
  const queue = await Queue.findOne({ doctorId, hospitalId, date });
  if (!queue) throw new Error('Queue not found');

  const nextEntry = queue.entries.find((entry) => entry.status === 'waiting');
  if (!nextEntry) return { message: 'No waiting patients', queue };

  nextEntry.status = 'called';
  nextEntry.calledAt = new Date();
  queue.currentToken = nextEntry.tokenNumber;
  await queue.save();

  const appointment = await Appointment.findById(nextEntry.appointmentId);
  if (appointment) {
    appointment.status = 'in-progress';
    appointment.calledAt = nextEntry.calledAt;
    await appointment.save();

    const patient = await Patient.findById(appointment.patientId);
    if (patient) {
      const user = await User.findById(patient.userId);
      if (user) {
        await createNotification({
          userId: user._id,
          type: 'its_turn_now',
          message: `It's your turn now. Token #${nextEntry.tokenNumber}`,
          relatedAppointmentId: appointment._id
        });
      }
    }
  }

  try {
    const io = getIO();
    io.to(`doctor:${doctorId}`).emit('appointment:called', {
      appointmentId: nextEntry.appointmentId,
      tokenNumber: nextEntry.tokenNumber
    });
  } catch {
    // no-op if socket unavailable
  }

  await emitQueueUpdate(queue);
  return { queue, called: nextEntry };
};

const completeAppointmentInQueue = async ({ appointmentId }) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw new Error('Appointment not found');

  const queue = await Queue.findOne({
    doctorId: appointment.doctorId,
    hospitalId: appointment.hospitalId,
    date: appointment.date
  });

  if (!queue) throw new Error('Queue not found');

  const entryIndex = queue.entries.findIndex((item) => String(item.appointmentId) === String(appointmentId));
  if (entryIndex < 0) throw new Error('Queue entry not found');

  const completedAt = new Date();

  appointment.status = 'completed';
  appointment.completedAt = completedAt;
  await appointment.save();

  // Remove completed appointment from active queue, then re-sequence remaining tokens.
  queue.entries.splice(entryIndex, 1);
  queue.entries.sort((a, b) => a.tokenNumber - b.tokenNumber);

  const avgMinutes = await getAverageConsultationMinutes(appointment.doctorId);
  const activeStatuses = ['waiting', 'called', 'in-progress'];

  for (let index = 0; index < queue.entries.length; index += 1) {
    const entry = queue.entries[index];
    entry.tokenNumber = index + 1;

    const linkedAppointment = await Appointment.findById(entry.appointmentId);
    if (linkedAppointment) {
      const ahead = queue.entries.filter(
        (item) => item.tokenNumber < entry.tokenNumber && activeStatuses.includes(item.status)
      ).length;
      linkedAppointment.tokenNumber = entry.tokenNumber;
      linkedAppointment.queuePosition = ahead + 1;
      linkedAppointment.estimatedWaitTime = ahead * avgMinutes;
      await linkedAppointment.save();
    }
  }

  queue.totalTokens = queue.entries.length;
  const currentlyCalled = queue.entries.find((item) => item.status === 'called' || item.status === 'in-progress');
  queue.currentToken = currentlyCalled ? currentlyCalled.tokenNumber : 0;
  await queue.save();

  await emitQueueUpdate(queue);

  return { queue, appointment };
};

const cancelAppointmentInQueue = async ({ appointmentId }) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw new Error('Appointment not found');

  const queue = await Queue.findOne({
    doctorId: appointment.doctorId,
    hospitalId: appointment.hospitalId,
    date: appointment.date
  });

  appointment.status = 'cancelled';
  appointment.queuePosition = 0;
  appointment.estimatedWaitTime = 0;
  await appointment.save();

  if (!queue) {
    return { queue: null, appointment };
  }

  const entryIndex = queue.entries.findIndex((item) => String(item.appointmentId) === String(appointmentId));
  if (entryIndex >= 0) {
    queue.entries.splice(entryIndex, 1);
  }

  queue.entries.sort((a, b) => a.tokenNumber - b.tokenNumber);

  const avgMinutes = await getAverageConsultationMinutes(appointment.doctorId);
  const activeStatuses = ['waiting', 'called', 'in-progress'];

  for (let index = 0; index < queue.entries.length; index += 1) {
    const entry = queue.entries[index];
    entry.tokenNumber = index + 1;

    const linkedAppointment = await Appointment.findById(entry.appointmentId);
    if (linkedAppointment) {
      const ahead = queue.entries.filter(
        (item) => item.tokenNumber < entry.tokenNumber && activeStatuses.includes(item.status)
      ).length;
      linkedAppointment.tokenNumber = entry.tokenNumber;
      linkedAppointment.queuePosition = ahead + 1;
      linkedAppointment.estimatedWaitTime = ahead * avgMinutes;
      await linkedAppointment.save();
    }
  }

  queue.totalTokens = queue.entries.length;
  const currentlyCalled = queue.entries.find((item) => item.status === 'called' || item.status === 'in-progress');
  queue.currentToken = currentlyCalled ? currentlyCalled.tokenNumber : 0;
  await queue.save();

  await emitQueueUpdate(queue);
  return { queue, appointment };
};

const addWalkIn = async ({ doctorId, hospitalId, date }) => {
  const walkInSlot = `walk-in-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const placeholderAppointment = await Appointment.create({
    patientId: null,
    doctorId,
    hospitalId,
    date,
    timeSlot: walkInSlot,
    status: 'confirmed',
    notes: 'Walk-in patient'
  });

  const result = await addAppointmentToQueue({ appointment: placeholderAppointment, isWalkIn: true });
  return { appointment: placeholderAppointment, ...result };
};

const resetQueue = async ({ doctorId, hospitalId, date }) => {
  const queue = await Queue.findOne({ doctorId, hospitalId, date });
  if (!queue) return null;

  queue.currentToken = 0;
  queue.totalTokens = 0;
  queue.entries = [];
  await queue.save();

  await emitQueueUpdate(queue);
  return queue;
};

module.exports = {
  getAverageConsultationMinutes,
  getOrCreateQueue,
  addAppointmentToQueue,
  getPatientQueueStatus,
  callNextPatient,
  completeAppointmentInQueue,
  cancelAppointmentInQueue,
  addWalkIn,
  resetQueue
};
