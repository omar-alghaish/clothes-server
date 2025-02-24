import { Schema, model, Document } from "mongoose";

export interface IDiscount extends Document {
  code: string;
  description?: string;
  discountPercentage?: number; // percentage discount (e.g., 15 for 15%)
  discountAmount?: number; // fixed amount discount (e.g., 20 for $20 off)
  startDate: Date;
  endDate: Date;
  maxUses: number;
  currentUses: number;
  isActive: boolean;
}

const discountSchema = new Schema<IDiscount>(
  {
    code: { type: String, required: true, unique: true },
    description: { type: String },
    discountPercentage: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    maxUses: { type: Number, required: true },
    currentUses: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default model<IDiscount>("Discount", discountSchema);
