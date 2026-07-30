import { Schema, model, Document } from 'mongoose';

export interface ISpaService {
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  isActive: boolean;
}

export interface IOperatingHours {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  open: string;
  close: string;
  isClosed: boolean;
}

export interface ISpa extends Document {
  name: string;
  description: string;
  address: string;
  neighborhood: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  operatingHours: IOperatingHours[];
  services: ISpaService[];
  averageRating: number;
  reviewCount: number;
  images: string[];
  isActive: boolean;
}

const spaServiceSchema = new Schema<ISpaService>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
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
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true }
);

const operatingHoursSchema = new Schema<IOperatingHours>(
  {
    day: {
      type: String,
      required: true,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    },
    open: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    close: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    isClosed: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const spaSchema = new Schema<ISpa>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    neighborhood: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator(value: number[]) {
            return value.length === 2 && value[0] >= -180 && value[0] <= 180 && value[1] >= -90 && value[1] <= 90;
          },
          message: 'Coordinates must be [longitude, latitude].',
        },
      },
    },
    operatingHours: {
      type: [operatingHoursSchema],
      default: [],
    },
    services: {
      type: [spaServiceSchema],
      default: [],
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    images: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

spaSchema.index({ location: '2dsphere' });
spaSchema.index({ name: 'text', description: 'text', neighborhood: 'text', 'services.name': 'text' });

export const Spa = model<ISpa>('Spa', spaSchema);
