import mongoose, { Document, Schema, Model } from "mongoose";

// Interface for the Item document
export interface IItem extends Document {
  name: string;
  rating: number;
  price: number;
  description: string;
  colors: string[];
  images: string[];
  reviewCount: number;
  img: string;
  category: mongoose.Schema.Types.ObjectId;  categoryField: string;
  gender: "male" | "female" | "neutral"; 
  sizes: string[];
  brand: mongoose.Schema.Types.ObjectId;
  featured: boolean;
  seller: mongoose.Types.ObjectId; 
  material: string; 
  countryOfOrigin: string; 
  createdAt: Date;
  updatedAt: Date;
}

interface IItemModel extends Model<IItem> {
  verifyOwner(item: IItem, userId: string): Promise<IItem>;
}

const itemSchema: Schema<IItem> = new Schema<IItem>(
  {
    name: { type: String, required: true },
    rating: {
      type: Number,
      default: 0, 
      min: [0, "Rating must be at least 0"],
      max: [5, "Rating must be at most 5"],
    },
    price: {
      type: Number,
      required: [true, "Item price is required"],
    },    
    description: {
      type: String,
      required: [true, "Item description is required"],
      trim: true,
    },    
    colors: {
      type: [String], 
      default: [], 
    },
    images: { type: [String], required: true },
    reviewCount: {
      type: Number,
      default: 0, 
    },
    img: {
      type: String,
      trim: true,
      // required: [true, 'A tour must have an image cover']
    },
  
    gender: {
      type: String,
      enum: ["male", "female", "neutral"],
      default: "male",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Item category is required"],
    },
    categoryField: {
      type: String,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true,
    },
    sizes: {
      type: [String], 
      default: [], 
    },
    brand:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      // required: [true, "Item brand is required"],
    },
    material: {
      type: String,
      //required: true, 
    },
    countryOfOrigin: {
      type: String,
      //required: true, 
    },
    featured: {
      type: Boolean,
      default: false, 
    },
  },
  { timestamps: true } 
);

itemSchema.statics.verifyOwner = async function (item: IItem, userId: string) {
  return item.seller.toString() === userId.toString();
};

// itemSchema.virtual('reviews', {
//   ref: 'Review',
//   foreignField:'tour',
//   localField:'_id'
// })

// Export the Item model
export const Item = mongoose.model<IItem, IItemModel>("Item", itemSchema);