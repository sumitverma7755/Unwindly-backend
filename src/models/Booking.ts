import { Schema, model, Document, Types } from 'mongoose';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface IBookedService {
  serviceId?: Types.ObjectId;
  name: string;
  durationMinutes: number;
  price: number;
}

export interface IBooking extends Document {
  user: Types.ObjectId;
  spa: Types.ObjectId;
  selectedService: IBookedService;
  appointmentAt: Date;
  status: BookingStatus;
  totalPrice: number;
}

const bookedServiceSchema = new Schema<IBookedService>(
  {
    serviceId: {
      type: Schema.Types.ObjectId,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const bookingSchema = new Schema<IBooking>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    spa: {
      type: Schema.Types.ObjectId,
      ref: 'Spa',
      required: true,
      index: true,
    },
    selectedService: {
      type: bookedServiceSchema,
      required: true,
    },
    appointmentAt: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

bookingSchema.index({ spa: 1, appointmentAt: 1 }, { unique: true, partialFilterExpression: { status: { $in: ['pending', 'confirmed'] } } });
bookingSchema.index({ user: 1, appointmentAt: -1 });

export const Booking = model<IBooking>('Booking', bookingSchema);
