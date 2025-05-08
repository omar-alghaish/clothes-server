import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";
import { Order } from "./orderModel";
import crypto from "crypto";

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
  avatarFile?: string;
  createdAt: Date;
  updatedAt: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  createPasswordResetToken(): string;
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
      unique: true,
      required: [true, "Email is required"],
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
    avatarFile: {
      type: String,
      default: "avatarFile.jpg"
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand", 
    },
    active: {
      type: Boolean,
      default: true, 
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
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

// Method to create password reset token
userSchema.methods.createPasswordResetToken = function (): string {
  // Generate a random token
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Hash the token and save it to the user document
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  // Set token expiration (10 minutes)
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
  
  // Return the unhashed token (to be sent via email)
  return resetToken;
};

// Export the User model
export const User = mongoose.model<IUser>("User", userSchema);