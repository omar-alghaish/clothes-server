import mongoose, { Document, Schema } from "mongoose";

// Define the OrderItem interface
export interface IOrderItem {
  product: mongoose.Types.ObjectId; // Reference to the Product model
  quantity: number; // Quantity of the product ordered
  price: number; // Price of the product at the time of ordering
}

// Define the Order interface
export interface IOrder extends Document {
  user: mongoose.Types.ObjectId; // Reference to the User model
  items: IOrderItem[]; // Array of ordered items
  totalPrice: number; // Total price of the order
  status: string; // Order status (e.g., pending, shipped, delivered)
  shippingAddress: string; // Shipping address for the order
  paymentMethod: string; // Payment method (e.g., credit card, PayPal)
  createdAt: Date; // Timestamp when the order was created
  updatedAt: Date; // Timestamp when the order was last updated
}

// Define the Order schema
const orderSchema: Schema<IOrder> = new Schema<IOrder>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: [true, "An order must belong to a user."],
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product", // Reference to the Product model
          required: [true, "An order item must reference a product."],
        },
        quantity: {
          type: Number,
          required: [true, "An order item must have a quantity."],
          min: [1, "Quantity must be at least 1."],
        },
        price: {
          type: Number,
          required: [true, "An order item must have a price."],
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: [true, "An order must have a total price."],
    },
    status: {
      type: String,
      enum: ["pending", "shipped", "delivered", "cancelled"], // Allowed order statuses
      default: "pending", // Default status is "pending"
    },
    shippingAddress: {
      type: String,
      required: [true, "An order must have a shipping address."],
    },
    paymentMethod: {
      type: String,
      required: [true, "An order must have a payment method."],
    },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

// Export the Order model
export const Order = mongoose.model<IOrder>("Order", orderSchema);