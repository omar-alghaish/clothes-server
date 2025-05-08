import mongoose, { Document, Schema, Model } from "mongoose";

// Interface for the Category document
export interface ICategory extends Document {
  name: string;
  description: string;
  parent: mongoose.Schema.Types.ObjectId | null;
  image: string;
  featured: boolean;
  gender: "male" | "female" | "neutral";
  createdAt: Date;
  updatedAt: Date;
}

interface ICategoryModel extends Model<ICategory> {
  createSlug(name: string): string;
}

const categorySchema: Schema<ICategory> = new Schema<ICategory>(
  {
    name: { 
      type: String, 
      required: [true, "Category name is required"],
      trim: true,
      unique: true
    },
    description: {
      type: String,
      trim: true
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null
    },
    image: {
      type: String,
      trim: true
    },
    featured: {
      type: Boolean,
      default: false
    },
    gender: {
      type: String,
      enum: ["male", "female", "neutral"],
      default: "male"
    }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual field for subcategories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent'
});

// Export the Category model
export const Category = mongoose.model<ICategory, ICategoryModel>("Category", categorySchema);