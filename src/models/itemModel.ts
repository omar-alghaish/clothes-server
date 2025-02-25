import mongoose, { Document, Schema, Model } from "mongoose";

// Interface for the Item document
export interface IItem extends Document {
  name: string;
  description: string;
  sizes: string[];
  price: number;
  imageCover: string;
  images: string[];
  seller: mongoose.Types.ObjectId; // Reference to the User model
  createdAt: Date;
  updatedAt: Date;
}

interface IItemModel extends Model<IItem> {
  verifyOwner(item: IItem, userId: string): Promise<IItem>;
}

const itemSchema: Schema<IItem> = new Schema<IItem>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    sizes: { type: [String], required: true },
    price: { type: Number, required: true },
    imageCover: {
      type: String,
      trim: true,
      required: [true, 'A tour must have an image cover']
    },
    images: { type: [String], required: true },
    seller: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the User model
      ref: "User", // Name of the referenced model
      required: true,
    },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

itemSchema.statics.verifyOwner = async function (item: IItem, userId: string) {
  return item.seller.toString() === userId.toString();
};

// Export the Item model
export const Item = mongoose.model<IItem, IItemModel>("Item", itemSchema);