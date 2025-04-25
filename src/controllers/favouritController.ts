import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { User } from "../models/userModel";
import { Item } from "../models/itemModel";
import { AppError } from "../utils/appError";
import  asyncHandler  from "../utils/catchAsyncError";

/**
 * Get all favorites for the current user
 */
export const getAllFavorites = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    const user = await User.findById(userId).populate({
      path: "favourits",
      select: "name description price imageCover sizes img images",
    });

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    res.status(200).json({
      status: "success",
      results: user.favourits.length,
      data: {
        favorites: user.favourits,
      },
    });
  }
);

/**
 * Get one favorite item
 */
export const getOneFavorite = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const itemId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return next(new AppError("Invalid item ID", 400));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Check if the item is in favorites
    const isFavorite = user.favourits.some(
      (favId) => favId.toString() === itemId
    );

    if (!isFavorite) {
      return next(new AppError("Item not found in favorites", 404));
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return next(new AppError("Item not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        favorite: item,
      },
    });
  }
);

/**
 * Add an item to favorites
 */
export const addToFavorites = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const itemId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return next(new AppError("Invalid item ID", 400));
    }

    // Check if item exists
    const item = await Item.findById(itemId);
    if (!item) {
      return next(new AppError("Item not found", 404));
    }

    // Add to favorites if not already added
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: { favourits: itemId }, // $addToSet ensures no duplicates
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    res.status(200).json({
      status: "success",
      message: "Item added to favorites",
      data: {
        user: {
          id: user._id,
          favorites: user.favourits,
        },
      },
    });
  }
);

/**
 * Remove an item from favorites
 */
export const removeFromFavorites = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const itemId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return next(new AppError("Invalid item ID", 400));
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $pull: { favourits: itemId },
      },
      { new: true }
    );

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    res.status(200).json({
      status: "success",
      message: "Item removed from favorites",
      data: {
        user: {
          id: user._id,
          favorites: user.favourits,
        },
      },
    });
  }
);

/**
 * Clear all favorites
 */
export const clearAllFavorites = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        favourits: [],
      },
      { new: true }
    );

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    res.status(200).json({
      status: "success",
      message: "All favorites cleared",
      data: {
        user: {
          id: user._id,
          favorites: user.favourits,
        },
      },
    });
  }
);