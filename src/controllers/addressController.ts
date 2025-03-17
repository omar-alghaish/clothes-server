import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Address, IAddress } from "./../models/addressModel"; 
import asyncHandler from "../utils/catchAsyncError";
import { AppError } from "../utils/appError";
import { User } from "../models/userModel";

export const createAddress = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      firstName,
      lastName,
      phoneNumber,
      email,
      country,
      city,
      state,
      streetAddress,
      zipCode,
    } = req.body;

    const userId = req.user?.id;

    if (
      !firstName ||
      !lastName ||
      !phoneNumber ||
      !email ||
      !country ||
      !city ||
      !state ||
      !streetAddress ||
      !zipCode
    ) {
      return next(new AppError("All fields are required.", 400));
    }



    // Create the new address
    const newAddress = await Address.create({
      firstName,
      lastName,
      phoneNumber,
      email,
      country,
      city,
      state,
      streetAddress,
      zipCode,
      user: userId, 
    });

    const user = await User.findByIdAndUpdate(
        userId,
        { $push: { addresses: newAddress._id } }, 
        { new: true } 
      );
  
      // If the user is not found, throw an error
      if (!user) {
        return next(new AppError("User not found.", 404));
      }

    // Send the response with the created address
    res.status(201).json({
      status: "success",
      data: {
        address: newAddress,
      },
    });
  }
);