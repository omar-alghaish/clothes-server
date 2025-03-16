import { Request, Response, NextFunction } from "express";
import Review from '../models/reviewModel'; 
import asyncHandler from '../utils/catchAsyncError';
import { Cart } from "../models/cartModel";
import { AppError } from "../utils/appError";

export const createReview = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { itemId, rating, comment } = req.body;
    const userId = req.user?.id
    // console.log(itemId, rating, comment, userId);
    
    const review = await Review.create({
      user: userId,
      item: itemId,
      rating,
      comment,
    });

    res.status(201).json({
      status: 'success',
      data: {
        review,
      },
    });
  }
);

export const getItemReviews = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const itemId = req.params.id;
  
      // Fetch reviews for the item and populate the user field
      const reviews = await Review.find({ item: itemId })
        .populate({
          path: 'user',
          select: 'firstName lastName email avatarFile', 
        })
        .populate({
            path: 'item',
            select: 'img', 
        });
  
      res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
          reviews,
        },
      });
    }
  );

  export const getAllReviews = asyncHandler(
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
 