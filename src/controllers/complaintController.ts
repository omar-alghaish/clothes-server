import { Request, Response, NextFunction } from "express";
import { Complaint, IComplaint } from "../models/complaintModel";
import asyncHandler from "../utils/catchAsyncError";
import { AppError } from "../utils/appError";
import { sendEmail } from "../utils/email";

// Submit a complaint
export const submitComplaint = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return next(
        new AppError("Please provide name, email, subject, and message", 400)
      );
    }

    // Create new complaint
    const newComplaint = await Complaint.create({
      name,
      email,
      subject,
      message,
      // If user is logged in, associate the complaint with their account
      user: req.user ? req.user.id : undefined,
    });

    // Send confirmation response
    res.status(201).json({
      status: "success",
      message: "Your complaint has been submitted successfully.",
      data: {
        complaint: newComplaint,
      },
    });
  }
);