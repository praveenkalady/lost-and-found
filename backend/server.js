import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/database.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import profileRoutes from './routes/profile.routes.js';
import itemRoutes from './routes/item.routes.js';
import searchRoutes from './routes/search.routes.js';
import custodianRoutes from './routes/custodian.routes.js';
import messageRoutes from './routes/message.routes.js';
import adminRoutes from './routes/admin.routes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:5173'],
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/custodians', custodianRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);

// Socket.io for real-time chat
const userSockets = new Map(); // userId -> socketId mapping

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // User authentication and registration
  socket.on('register', (userId) => {
    userSockets.set(userId.toString(), socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  // Join a conversation room
  socket.on('join_conversation', ({ userId, itemId }) => {
    const room = `conversation_${Math.min(userId, socket.userId)}_${Math.max(userId, socket.userId)}_${itemId}`;
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  // Send message
  socket.on('send_message', async (data) => {
    const { receiver_id, item_id, message_text, sender_id, sender_name } = data;
    
    // Emit to receiver if they're online
    const receiverSocketId = userSockets.get(receiver_id.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('new_message', {
        sender_id,
        sender_name,
        receiver_id,
        item_id,
        message_text,
        created_at: new Date().toISOString()
      });
    }
    
    // Also emit back to sender for confirmation
    socket.emit('message_sent', {
      sender_id,
      receiver_id,
      item_id,
      message_text,
      created_at: new Date().toISOString()
    });
  });

  // Typing indicator
  socket.on('typing', ({ receiver_id, item_id }) => {
    const receiverSocketId = userSockets.get(receiver_id.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user_typing', { item_id });
    }
  });

  socket.on('stop_typing', ({ receiver_id, item_id }) => {
    const receiverSocketId = userSockets.get(receiver_id.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user_stop_typing', { item_id });
    }
  });
  
  socket.on('disconnect', () => {
    // Remove user from mapping
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

// Make io accessible to routes
app.set('io', io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
});
