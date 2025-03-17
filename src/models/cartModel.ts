import mongoose, { Document, Schema } from "mongoose";

// Define the CartItem interface
export interface ICartItem {
  product: mongoose.Schema.Types.ObjectId
  brand: mongoose.Schema.Types.ObjectId;
  quantity: number;
  price: number; 
  size: string;
  color: string;
  img: string;
}

// Define the Cart interface
export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: ICartItem[]; 
  totalPrice: number; 
  createdAt: Date;
  updatedAt: Date;
}

// Define the Cart schema
const cartSchema: Schema<ICart> = new Schema<ICart>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, 
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item",
          required: true,
        },
        brand: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Brand",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
        },
        price: {
          type: Number,
          required: true,
        },
        size: {
          type: String,
          required: true,
        },
        color: {
          type: String,
          required: true,
        },
        img: {
          type: String,
          required: true,
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true } 
);


cartSchema.pre<ICart>("save", function (next) {
    this.totalPrice = this.items.reduce((total, item) => total + item.price * item.quantity, 0);
    next();
});


// Export the Cart model
export const Cart = mongoose.model<ICart>("Cart", cartSchema);