import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import connectDB from './config/db.js';
import gameRoutes from './routes/gameRoutes.js';
import { setupSocketHandlers } from './socket/socketHandlers.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// MongoDB verbinden
connectDB();

// Middleware
if (process.env.CLIENT_URL) {
  app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
} else {
  app.use(cors());
}
app.use(express.json());

// API-Routes
app.use('/api/game', gameRoutes);

// ⚠️ KEIN Frontend-Serving mehr hier – nur API/Socket
// Wenn du später ein gebautes Frontend hast, können wir das wieder aktivieren.

// Socket.io setup
setupSocketHandlers(io);

// Health-Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('📡 Socket.io ready for connections');
});

export { io };
