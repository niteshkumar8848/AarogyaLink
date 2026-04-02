const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const { seedDefaultAccounts } = require('./services/bootstrapService');

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();
    await seedDefaultAccounts();

    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true
      }
    });

    initSocket(io);

    io.on('connection', (socket) => {
      socket.on('join:user', ({ userId }) => {
        if (userId) socket.join(`user:${userId}`);
      });

      socket.on('doctor:next', ({ doctorId }) => {
        if (doctorId) {
          io.to(`doctor:${doctorId}`).emit('queue:updated', { doctorId });
        }
      });

      socket.on('doctor:complete', ({ appointmentId }) => {
        if (appointmentId) {
          io.emit('appointment:called', { appointmentId, status: 'completed' });
        }
      });
    });

    server.listen(PORT, () => {
      console.log(`AarogyaLink server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server failed to start:', error.message);
    process.exit(1);
  }
};

start();
