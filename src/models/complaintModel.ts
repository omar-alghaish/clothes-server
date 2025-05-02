import mongoose, { Document, Schema } from "mongoose";

// Interface for Complaint Document
export interface IComplaint extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "pending" | "in-progress" | "resolved" | "rejected";
  user?: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Complaint Schema
const complaintSchema: Schema<IComplaint> = new Schema<IComplaint>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Please use a valid email address"],
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "resolved", "rejected"],
      default: "pending",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Export the Complaint model
export const Complaint = mongoose.model<IComplaint>("Complaint", complaintSchema);