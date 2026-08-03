import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connectDatabase } from './config/database';
import { acquireSlotLock } from './config/redis';
import spaRoutes from './routes/spaRoutes';
import authRoutes from './routes/authRoutes';
import bookingRoutes from './routes/bookingRoutes';
import productRoutes from './routes/productRoutes';
import adminRoutes from './routes/adminRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/spas', spaRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);

// Serve Static Web Frontend Assets
const publicDir = path.join(process.cwd(), 'public');
app.use(express.static(publicDir));

// Health Check Endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Spa Finder API Gateway',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Demo Slot Lock Endpoint (Real-time Pessimistic Holding)
app.post('/api/v1/demo/hold-slot', async (req: Request, res: Response) => {
  const { spa_id, slot_time } = req.body;
  const lockKey = `hold:spa:${spa_id}:slot:${slot_time}`;
  
  const acquired = await acquireSlotLock(lockKey, 'locked', 600); // 10 min hold
  if (!acquired) {
    return res.status(409).json({
      success: false,
      message: 'Time slot is currently locked by another customer. Please choose a different slot.'
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Slot locked successfully for 10 minutes.',
    lockKey
  });
});

// Serve Main Web Frontend SPA
app.get('/', (_req: Request, res: Response) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.use((err: Error, _req: Request, res: Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? undefined : err.message,
  });
});

const startServer = async (): Promise<void> => {
  try {
    try {
      await connectDatabase();
    } catch (dbError) {
      console.warn('Database connection warning (running in standalone mode):', dbError);
    }

    app.listen(PORT, () => {
      console.log(`\nGraven Automation Web & Smart Product Scanner live at: http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

void startServer();
