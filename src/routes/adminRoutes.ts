import { Router, Request, Response, NextFunction } from 'express';
import { Spa } from '../models/Spa';
import { Booking } from '../models/Booking';
import { User } from '../models/User';

const router = Router();

// GET /api/admin/stats - Get high level dashboard analytics
router.get('/stats', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const totalSpas = await Spa.countDocuments();
    const activeSpas = await Spa.countDocuments({ isActive: true });
    const totalBookings = await Booking.countDocuments();
    const totalUsers = await User.countDocuments();

    // Calculate total revenue from non-cancelled bookings
    const revenueResult = await Booking.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Spa Breakdown: booking count and revenue per spa
    const spaBreakdown = await Booking.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: '$spa',
          bookingsCount: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      },
      {
        $lookup: {
          from: 'spas',
          localField: '_id',
          foreignField: '_id',
          as: 'spaDetails'
        }
      },
      { $unwind: '$spaDetails' },
      {
        $project: {
          _id: 1,
          name: '$spaDetails.name',
          neighborhood: '$spaDetails.neighborhood',
          bookingsCount: 1,
          revenue: 1
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalSpas,
        activeSpas,
        totalBookings,
        totalUsers,
        totalRevenue,
        spaBreakdown
      }
    });
  } catch (error) {
    return next(error);
  }
});

// GET /api/admin/spas - Get all spas (active and inactive)
router.get('/spas', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const spas = await Spa.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: spas.length,
      data: spas
    });
  } catch (error) {
    return next(error);
  }
});

// POST /api/admin/spas - Create a new spa
router.post('/spas', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, address, neighborhood, coordinates, operatingHours, services, images, isActive } = req.body;

    if (!name || !description || !address || !neighborhood || !coordinates) {
      return res.status(400).json({ message: 'Name, description, address, neighborhood, and coordinates [lng, lat] are required.' });
    }

    const newSpa = await Spa.create({
      name,
      description,
      address,
      neighborhood,
      location: {
        type: 'Point',
        coordinates: coordinates // expected to be [lng, lat]
      },
      operatingHours: operatingHours || [],
      services: services || [],
      images: images || [],
      isActive: isActive !== undefined ? isActive : true
    });

    return res.status(201).json({
      success: true,
      message: 'Spa created successfully.',
      data: newSpa
    });
  } catch (error) {
    return next(error);
  }
});

// PUT /api/admin/spas/:id - Update an existing spa
router.put('/spas/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, address, neighborhood, coordinates, operatingHours, services, images, isActive } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (address !== undefined) updateData.address = address;
    if (neighborhood !== undefined) updateData.neighborhood = neighborhood;
    if (coordinates !== undefined) {
      updateData.location = {
        type: 'Point',
        coordinates: coordinates
      };
    }
    if (operatingHours !== undefined) updateData.operatingHours = operatingHours;
    if (services !== undefined) updateData.services = services;
    if (images !== undefined) updateData.images = images;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedSpa = await Spa.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedSpa) {
      return res.status(404).json({ message: 'Spa not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Spa updated successfully.',
      data: updatedSpa
    });
  } catch (error) {
    return next(error);
  }
});

// DELETE /api/admin/spas/:id - Delete a spa
router.delete('/spas/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deletedSpa = await Spa.findByIdAndDelete(req.params.id);
    if (!deletedSpa) {
      return res.status(404).json({ message: 'Spa not found.' });
    }
    return res.status(200).json({
      success: true,
      message: 'Spa deleted successfully.'
    });
  } catch (error) {
    return next(error);
  }
});

// GET /api/admin/bookings - Get all bookings with spa and user details
router.get('/bookings', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const bookings = await Booking.find()
      .populate('spa', 'name address neighborhood')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    return next(error);
  }
});

// PUT /api/admin/bookings/:id - Update booking status
router.put('/bookings/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    if (!status || !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Valid status (pending, confirmed, completed, cancelled) is required.' });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    ).populate('spa', 'name address neighborhood').populate('user', 'name email phone');

    if (!updatedBooking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Booking status updated successfully.',
      data: updatedBooking
    });
  } catch (error) {
    return next(error);
  }
});

// GET /api/admin/users - Get all registered users
router.get('/users', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
