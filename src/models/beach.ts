import mongoose, { Document, Model } from "mongoose";

export enum BeachPosition {
    S = 'S',
    E = 'E',
    W = 'W',
    N = 'N',
}

export interface IBeach {
    _id?: string;
    lat: number;
    lon: number;
    name: string;
    position: BeachPosition;
}

const schema = new mongoose.Schema(
    {
      lat: { type: Number, required: true },
      lon: { type: Number, required: true },
      name: { type: String, required: true },
      position: { type: String, required: true },
    },
    {
      toJSON: {
        transform: (_, ret): void => {
          ret.id = ret._id;
          delete ret._id;
          delete ret.__v;
        },
      },
    }
);

interface IBeachModel extends Omit<IBeach, '_id'>, Document {}
export const Beach: Model<IBeachModel> = mongoose.model('Beach', schema);