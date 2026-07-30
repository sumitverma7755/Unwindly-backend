import { Router, Response, NextFunction } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';
import { Booking } from '../models/Booking';
import { Spa } from '../models/Spa';
import { User } from '../models/User';
import { releaseSlotLock } from '../config/redis';

const router = Router();

// Create a new booking
router.post('/', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { spaId, serviceName, appointmentAt, slotTime } = req.body;
    const userId = req.user?.id;

    if (!spaId || !serviceName || !appointmentAt || !slotTime) {
      return res.status(400).json({ message: 'All booking fields (spaId, serviceName, appointmentAt, slotTime) are required.' });
    }

    // Find the Spa
    const spa = await Spa.findById(spaId);
    if (!spa) {
      return res.status(404).json({ message: 'Spa not found.' });
    }

    // Find the Service inside Spa
    const service = spa.services.find(s => s.name === serviceName && s.isActive);
    if (!service) {
      return res.status(404).json({ message: 'Requested service is not available or inactive.' });
    }

    // Release the Redis slot lock (the user is now finalising their booking)
    const lockKey = `hold:spa:${spaId}:slot:${appointmentAt.slice(0, 10)}_${slotTime}`;
    await releaseSlotLock(lockKey);

    // Create the booking
    const booking = await Booking.create({
      user: userId,
      spa: spaId,
      selectedService: {
        serviceId: service._id,
        name: service.name,
        durationMinutes: service.durationMinutes,
        price: service.price
      },
      appointmentAt: new Date(appointmentAt),
      status: 'confirmed', // Bookings created in this step are confirmed directly (simulate paid/accepted)
      totalPrice: service.price
    });

    // Add to user booking history
    await User.findByIdAndUpdate(userId, {
      $push: { bookingHistory: booking._id }
    });

    return res.status(201).json({
      success: true,
      message: 'Booking created and confirmed successfully.',
      data: booking
    });
  } catch (error) {
    return next(error);
  }
});

// List authenticated user's bookings
router.get('/', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const bookings = await Booking.find({ user: userId })
      .populate('spa', 'name address neighborhood location images')
      .sort({ appointmentAt: -1 })
      .lean();

    return res.status(200).json({
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
