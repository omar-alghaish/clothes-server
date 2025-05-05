import mongoose, { Document, Schema } from "mongoose";

export interface IBrand extends Document {
  brandName: string;
  brandDescription: string;
  brandStyle: string;
  brandLogo: string;
  primaryColor: string;
  businessAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  phoneNumber: string;
  website: string;
  taxId: string;
  user: mongoose.Schema.Types.ObjectId; // Reference to the user who owns the brand
}

const brandSchema: Schema<IBrand> = new Schema<IBrand>(
  {
    brandName: {
      type: String,
      required: [true, "Brand name is required"],
      trim: true,
      //unique: true,
    },
    brandDescription: {
      type: String,
      required: [true, "Brand description is required"],
      trim: true,
    },
    brandStyle: {
      type: String,
      required: [true, "Brand style is required"],
      trim: true,
    },
    brandLogo: {
      type: String,
      required: [true, "Brand logo is required"],
      trim: true,
    },
    primaryColor: {
      type: String,
      required: [true, "Primary color is required"],
      trim: true,
    },
    businessAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    taxId: {
      type: String,
      required: [true, "Tax ID is required"],
      trim: true,
      //unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User collection
      required: true,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

export const Brand = mongoose.model<IBrand>("Brand", brandSchema);