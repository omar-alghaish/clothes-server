import mongoose, { Document, Schema } from "mongoose";

// Define the OrderItem interface
export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  quantity: number; 
  price: number;
}

// Define the Order interface
export interface IOrder extends Document {
  user: mongoose.Types.ObjectId; 
  items: IOrderItem[];
  shipping: number;
  tax: number; 
  subTotal: number;
  totalPrice: number;
  status: string; 
  shippingAddress: mongoose.Types.ObjectId;  
  paymentMethod: mongoose.Types.ObjectId; 
  createdAt: Date; 
  updatedAt: Date; 
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
    shipping: {
      type: Number,
      required: [true, "Shipping cost is required."],
      default: 0, 
    },
    tax: {
      type: Number,
      required: [true, "Tax amount is required."],
      default: 0, 
    },
    subTotal: {
      type: Number,
      required: [true, "Subtotal is required."],
      default: 0, 
    },
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
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address", 
      required: [true, "An order must have a shipping address."],
    },
    paymentMethod: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentCard", // Reference to the Payment model
      required: [true, "An order must have a payment method."],
    },
  },
  { timestamps: true } 
);

// Export the Order model
export const Order = mongoose.model<IOrder>("Order", orderSchema);