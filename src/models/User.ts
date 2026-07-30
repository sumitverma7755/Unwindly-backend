import { Schema, model, Document, Types } from 'mongoose';

export interface IUser extends Document {
  name: string;
  phone: string;
  email: string;
  password: string;
  savedSpas: Types.ObjectId[];
  bookingHistory: Types.ObjectId[];
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      type: String,
      required: true,
    },
    savedSpas: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Spa',
      },
    ],
    bookingHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Booking',
      },
    ],
  },
  { timestamps: true }
);

export const User = model<IUser>('User', userSchema);
