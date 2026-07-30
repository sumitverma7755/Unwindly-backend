import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authorization token required' });
  }

  const jwtSecret = process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production';

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err || !decoded) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    const payload = decoded as { id: string; email: string };
    req.user = { id: payload.id, email: payload.email };
    next();
  });
};
