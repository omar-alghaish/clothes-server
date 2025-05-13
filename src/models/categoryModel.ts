import mongoose, { Document, Schema, Model } from "mongoose";

export interface ICategory extends Document {
  name: string;
  description: string;
  parentCategory?: mongoose.Schema.Types.ObjectId;
  isActive: boolean;
  gender?: string;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema: Schema<ICategory> = new Schema<ICategory>(
  {
    name: { 
      type: String, 
      required: [true, "Category name is required"],
      unique: true,
      trim: true 
    },
    description: {
      type: String,
      trim: true
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category"
    },
    isActive: {
      type: Boolean,
      default: true
    },
    gender: {
      type: String,
      enum: ["male", "female", "neutral", null],
      default: 'neutral'
    }
  },
  { timestamps: true }
);

// Create indexes for better query performance
categorySchema.index({ name: 1 });
categorySchema.index({ parentCategory: 1 });

// Export the Category model
export const Category = mongoose.model<ICategory>("Category", categorySchema);