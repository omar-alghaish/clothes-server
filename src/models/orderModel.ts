import mongoose, { Document, Schema } from "mongoose";

// Define the OrderItem interface
export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  brand: mongoose.Schema.Types.ObjectId;
  quantity: number; 
  price: number;
  size: string;
  color: string;
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
  estimatedDate: Date;
  active: boolean;
  createdAt: Date; 
  updatedAt: Date; 
}

// Define the Order schema
const orderSchema: Schema<IOrder> = new Schema<IOrder>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "An order must belong to a user."],
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: [true, "An order item must reference a product."],
        },
        brand: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Brand",
          required: true,
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
        size: {
          type: String,
          required: true,
        },
        color: {
          type: String,
          required: true,
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
      enum: ["pending", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    shippingAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: [true, "An order must have a shipping address."],
    },
    paymentMethod: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentCard",
      required: [true, "An order must have a payment method."],
    },
    estimatedDate: {
      type: Date,
      required: true,
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

orderSchema.pre<IOrder>("save", function (next) {
  if (!this.estimatedDate) {
    const estimated = new Date(this.createdAt || Date.now());
    estimated.setDate(estimated.getDate() + 3);
    this.estimatedDate = estimated;
  }
  next();
});

// Export the Order model
export const Order = mongoose.model<IOrder>("Order", orderSchema);
