import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

const router = Router();
const BCRYPT_SALT_ROUNDS = 10;

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields (name, email, phone, password) are required.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(409).json({ message: 'A user with this email or phone number already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    // Create user
    const newUser = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      savedSpas: [],
      bookingHistory: [],
    });

    // Generate JWT
    const jwtSecret = process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production';
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, name: newUser.name },
      jwtSecret,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      return res.status(400).json({ message: 'Email/Phone and password are required.' });
    }

    // Find user by email or phone
    const user = await User.findOne({
      $or: [{ email: emailOrPhone.toLowerCase() }, { phone: emailOrPhone }],
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Generate JWT
    const jwtSecret = process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production';
    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      jwtSecret,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
