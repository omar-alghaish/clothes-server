import mongoose, { Document, Schema } from "mongoose";

export interface Iitem extends Document {
  name: string;
  description: string;
  sizes: string[];
  price: number;
  images: string[];
  createdAt: Date;
}

const itemSchema: Schema = new Schema<Iitem>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    sizes: { type: [String], required: true },
    price: { type: Number, required: true },
    images: { type: [String], required: true },
  },
  { timestamps: true }
);

export const item = mongoose.model<Iitem>("item", itemSchema);
