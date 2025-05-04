import { Request, Response, NextFunction } from "express";
import Review from '../models/reviewModel'; 
import asyncHandler from '../utils/catchAsyncError';
import { Cart } from "../models/cartModel";
import { AppError } from "../utils/appError";
import { Brand, IBrand } from "../models/brandModel";

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

  export const getMyBrand = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?.id;
  
      // Find the brand associated with the authenticated user
      const brand = await Brand.findOne({ user: userId });      
  
      // Check if the user has a brand
      if (!brand) {
        return next(new AppError("No brand found for this user", 404));
      }
  
      // Send the response
      res.status(200).json({
        status: "success",
        data: {
          brand
        }
      });
    }
  );

export const updateBrand = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    
    // Find the brand by ID
    const brand = await Brand.findById(id);
    
    // Check if brand exists
    if (!brand) {
      return next(new AppError("Brand not found", 404));
    }
    
    // Check if user is authorized to update this brand
    if (brand.user.toString() !== req.user?.id) {
      return next(new AppError("You do not have permission to update this brand", 403));
    }
    
    // Fields that can be updated
    const updatableFields = [
      "brandName",
      "brandDescription",
      "brandStyle",
      "brandLogo",
      "primaryColor",
      "businessAddress",
      "phoneNumber",
      "website",
      "taxId"
    ];
    
    // Create update object with only the allowed fields
    const updateData: Partial<IBrand> = {};
    
    Object.keys(req.body).forEach(key => {
      if (updatableFields.includes(key)) {
        // Handle nested businessAddress object separately
        if (key === "businessAddress") {
          updateData.businessAddress = {
            ...brand.businessAddress,
            ...req.body.businessAddress
          };
        } else {
          // Use type assertion to handle dynamic key access
          (updateData as any)[key] = req.body[key];
        }
      }
    });
    
    // Update the brand
    const updatedBrand = await Brand.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true, // Return the updated document
        runValidators: true // Run schema validators
      }
    );
    
    res.status(200).json({
      status: "success",
      data: {
        brand: updatedBrand
      }
    });
  }
);