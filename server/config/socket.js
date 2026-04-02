let ioInstance;

const initSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    socket.on('queue:join', ({ appointmentId, doctorId }) => {
      if (appointmentId) socket.join(`appointment:${appointmentId}`);
      if (doctorId) socket.join(`doctor:${doctorId}`);
    });

    socket.on('queue:leave', ({ appointmentId, doctorId }) => {
      if (appointmentId) socket.leave(`appointment:${appointmentId}`);
      if (doctorId) socket.leave(`doctor:${doctorId}`);
    });

    socket.on('disconnect', () => {
      // No-op. Rooms clean automatically.
    });
  });
};

const getIO = () => {
  if (!ioInstance) throw new Error('Socket.IO has not been initialized.');
  return ioInstance;
};

module.exports = { initSocket, getIO };
