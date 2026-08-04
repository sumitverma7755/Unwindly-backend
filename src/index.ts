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

// Base64 Image Upload Endpoint
app.post('/api/upload', (req: Request, res: Response) => {
  try {
    const { name, data } = req.body;
    if (!name || !data) {
      return res.status(400).json({ message: 'Filename and base64 data are required.' });
    }

    const fs = require('fs');
    const base64Data = data.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(name) || '.jpg';
    const filename = `spa-${uniqueSuffix}${ext}`;
    
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, buffer);

    const host = req.get('host') || `localhost:${PORT}`;
    const protocol = req.secure ? 'https' : 'http';
    const imageUrl = `${protocol}://${host}/uploads/${filename}`;

    console.log(`Image saved locally to backend: ${filepath}`);
    console.log(`Public URL: ${imageUrl}`);

    return res.status(200).json({
      success: true,
      url: imageUrl
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return res.status(500).json({
      message: 'Failed to upload image.',
      error: error.message
    });
  }
});

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
      const baseUrl = process.env.RENDER_EXTERNAL_URL || process.env.SERVER_URL || `http://localhost:${PORT}`;
      console.log(`\nUnwindly Spa Finder Backend API live at: ${baseUrl}`);
      console.log(`Health check: ${baseUrl}/health\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

void startServer();
