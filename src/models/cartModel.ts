import mongoose, { Document, Schema } from "mongoose";

// Define the CartItem interface
export interface ICartItem {
  product: mongoose.Types.ObjectId; // Reference to the Product model
  quantity: number;
  price: number; // Price at the time of adding to cart (to handle price changes)
}

// Define the Cart interface
export interface ICart extends Document {
  user: mongoose.Types.ObjectId; // Reference to the User model
  items: ICartItem[]; // Array of cart items
  totalPrice: number; // Total price of all items in the cart
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
      unique: true, // Each user can have only one cart
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
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
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);


cartSchema.pre<ICart>("save", function (next) {
    this.totalPrice = this.items.reduce((total, item) => total + item.price * item.quantity, 0);
    next();
});


// Export the Cart model
export const Cart = mongoose.model<ICart>("Cart", cartSchema);