import express from 'express';
import dotenv from 'dotenv';
import crypto from 'node:crypto';

// Polyfill global crypto for libraries that expect it (e.g., in Node < 19)
if (typeof globalThis.crypto === 'undefined') {
  (globalThis as any).crypto = crypto;
}

dotenv.config();

// Force restart to pick up new env vars
import cors from 'cors';
import { connectDB } from './config/db';
import { errorHandler, notFound } from './middleware/error';

// Route imports
import authRoutes from './routes/authRoutes';
import projectRoutes from './routes/projectRoutes';
import taskRoutes from './routes/taskRoutes';
import inviteRoutes from './routes/inviteRoutes';
import userRoutes from './routes/userRoutes';

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
const allowedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL, 'http://localhost:5173'] 
  : ['http://localhost:5173'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.includes('railway.app') || origin.includes('vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/invites', inviteRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
