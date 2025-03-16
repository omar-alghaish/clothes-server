import { Request, Response, NextFunction } from "express";
import Review from '../models/reviewModel'; 
import asyncHandler from '../utils/catchAsyncError';
import { Cart } from "../models/cartModel";
import { AppError } from "../utils/appError";

  export const getBrand = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      // Fetch all reviews and populate the user and item fields
      const reviews = await Review.find()
        .populate({
          path: 'user',
          select: 'firstName lastName', 
        })
        .populate({
          path: 'item',
          select: 'name img',
        });
  
      res.status(200).json({
        status: "success",
        results: reviews.length,
        data: {
          reviews,
        },
      });
    }
  );
 