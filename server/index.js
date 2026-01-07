import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.js';
import commentRoutes from './routes/comments.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
// const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'https://commentclint.netlify.app' || "http://localhost:5173";
const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: CLIENT_ORIGIN,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// Socket.io
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log('User disconnected', socket.id);
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/comments', commentRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

// Make io accessible in routes
app.set('socketio', io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
