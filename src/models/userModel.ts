import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";
import { Order } from "./orderModel";

// Interface for User Document
export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: "male" | "female";
  favourits: mongoose.Schema.Types.ObjectId[];
  orders: mongoose.Schema.Types.ObjectId[];
  addresses: mongoose.Schema.Types.ObjectId[];
  password: string;
  passwordConfirm: string | undefined;
  role: "user" | "seller" | "admin"; 
  photo?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  brand?: mongoose.Schema.Types.ObjectId;
  active: boolean;
}

// User Schema
const userSchema: Schema<IUser> = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Please use a valid email address"],
    },
    phone:{
      type: String
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      default: "male",
    },
    favourits: {
      type: [mongoose.Schema.Types.ObjectId], 
      ref: "Item",
    },
    orders: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Order"
    },
    addresses:{ 
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Address"
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"]
    },
    role: {
      type: String,
      enum: ["user", "seller", "admin"],
      default: "user",
    },
    photo: {
      type: String,
      default: "photo.jpg"
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand", 
    },
    active: {
      type: Boolean,
      default: true, 
    },
  },
  {
    timestamps: true, 
  }
);

// Pre-save hook to hash password before saving
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordConfirm = undefined;
    next();
  } catch (err) {
    next(err as Error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Export the User model
export const User = mongoose.model<IUser>("User", userSchema); 