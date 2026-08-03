import { Router, Request, Response, NextFunction } from 'express';
import { Spa } from '../models/Spa';

const router = Router();
const DEFAULT_RADIUS_METERS = 10000; // 10km default

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/spas/areas - Fetch searchable Lucknow areas with active spa counts
router.get('/areas', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const areas = await Spa.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$neighborhood',
          spaCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          spaCount: 1,
        },
      },
      { $sort: { name: 1 } },
    ]);

    return res.status(200).json({
      count: areas.length,
      data: areas,
    });
  } catch (error) {
    return next(error);
  }
});

// GET /api/spas/nearby - Fetch spas with optional geolocation, search queries, filtering, and sorting
router.get('/nearby', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lat = req.query.lat ? Number(req.query.lat) : undefined;
    const lng = req.query.lng ? Number(req.query.lng) : undefined;
    const radiusMeters = req.query.radiusKm ? Number(req.query.radiusKm) * 1000 : DEFAULT_RADIUS_METERS;
    const query = req.query.query ? String(req.query.query).trim() : undefined;
    const category = req.query.category ? String(req.query.category).trim() : undefined;
    const area = req.query.area ? String(req.query.area).trim() : undefined;
    const sort = req.query.sort ? String(req.query.sort).toLowerCase() : 'recommended';

    // Construct DB Query
    const dbQuery: any = { isActive: true };

    // Apply Geolocation filter if coordinates are provided
    const hasCoords = lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng);
    if (hasCoords) {
      dbQuery.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          $maxDistance: radiusMeters,
        },
      };
    }

    // Apply Text search / Regex search
    if (query) {
      dbQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { neighborhood: { $regex: query, $options: 'i' } },
        { 'services.name': { $regex: query, $options: 'i' } },
      ];
    }

    // Apply exact area/neighborhood filter
    if (area && area !== 'All') {
      dbQuery.neighborhood = { $regex: `^${escapeRegExp(area)}$`, $options: 'i' };
    }

    // Apply Category filter
    if (category && category !== 'All') {
      dbQuery.$and = dbQuery.$and || [];
      dbQuery.$and.push({
        $or: [
          { 'services.name': { $regex: category, $options: 'i' } },
          { description: { $regex: category, $options: 'i' } },
        ],
      });
    }

    // Execute query
    let spas = await Spa.find(dbQuery).lean();

    // Fallback: If 0 spas found due to geo-restriction (user outside 10km radius), fallback to non-geo query
    if (spas.length === 0 && hasCoords) {
      delete dbQuery.location;
      spas = await Spa.find(dbQuery).lean();
    }


    // Custom sorting since Mongoose $near might not play nice with other manual sorts, or for non-geo queries
    if (sort === 'rating') {
      spas.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    } else if (sort === 'price') {
      const getMinPrice = (spa: any) => Math.min(...spa.services.map((s: any) => s.price));
      spas.sort((a, b) => getMinPrice(a) - getMinPrice(b));
    } else if (sort === 'distance' && hasCoords) {
      // If we used $near, it's already sorted by distance by MongoDB!
      // But if we want to calculate distance or sort:
      // Since it's already sorted by $near, we don't strictly need to resort unless no geo query.
    } else if (sort === 'recommended') {
      // Sort by rating (descending) and review count
      spas.sort((a, b) => ((b.averageRating || 0) * 10 + (b.reviewCount || 0)) - ((a.averageRating || 0) * 10 + (a.reviewCount || 0)));
    }

    return res.status(200).json({
      count: spas.length,
      data: spas,
    });
  } catch (error) {
    return next(error);
  }
});

// GET /api/spas/:id - Get detailed spa info
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const spa = await Spa.findById(req.params.id).lean();
    if (!spa) {
      return res.status(404).json({ message: 'Spa not found' });
    }
    return res.status(200).json(spa);
  } catch (error) {
    return next(error);
  }
});

export default router;
