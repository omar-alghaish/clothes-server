import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Address, IAddress } from "./../models/addressModel"; 
import asyncHandler from "../utils/catchAsyncError";
import { AppError } from "../utils/appError";
import { User } from "../models/userModel";

export const getAddresses = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id; // Get the authenticated user's ID

    // Fetch all addresses for the user
    const addresses = await Address.find({ user: userId });

    // Send the response
    res.status(200).json({
      status: "success",
      data: {
        addresses,
      },
    });
  }
);

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

export const updateAddress = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    const addressId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return next(new AppError("Invalid address ID", 400));
    }

    // Check if address exists and belongs to the user
    const address = await Address.findOne({
      _id: addressId,
      user: userId
    });

    if (!address) {
      return next(new AppError("Address not found or you don't have permission to update it", 404));
    }

    // Filter out fields that shouldn't be updated
    const filteredBody = { ...req.body };
    const forbiddenUpdates = ['user', '_id', 'createdAt', 'updatedAt'];
    forbiddenUpdates.forEach(field => delete filteredBody[field]);

    // Update the address
    const updatedAddress = await Address.findByIdAndUpdate(
      addressId,
      filteredBody,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: "success",
      data: { address: updatedAddress }
    });
  }
);

/**
 * Delete an address
 */
export const deleteAddress = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    const addressId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return next(new AppError("Invalid address ID", 400));
    }

    // Check if address exists and belongs to the user
    const address = await Address.findOne({
      _id: addressId,
      user: userId
    });

    if (!address) {
      return next(new AppError("Address not found or you don't have permission to delete it", 404));
    }

    // Delete address
    await Address.findByIdAndDelete(addressId);

    // Remove address from user's addresses array
    await User.findByIdAndUpdate(
      userId,
      { $pull: { addresses: addressId } }
    );

    res.status(204).json({
      status: "success",
      data: null
    });
  }
);
