import { Request, Response, NextFunction } from "express";
import Review from '../models/reviewModel'; 
import asyncHandler from '../utils/catchAsyncError';
import { Cart } from "../models/cartModel";
import { AppError } from "../utils/appError";
import { Brand, IBrand } from "../models/brandModel";
import multer from 'multer';
import sharp from 'sharp';
import cloudinary from "../configs/cloudinaryConfig";

// Setup multer storage and filter for brand logo uploads
const multerStorage = multer.memoryStorage();

function multerFilter(req: Request, file: Express.Multer.File, cb: Function) {
  if (file.mimetype.startsWith('image')) cb(null, true);
  else cb(new AppError('Not an image! Please upload only images.', 400), false);
}

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

// Middleware for brand logo upload
export const uploadBrandLogo = upload.single('brandLogo');

// Middleware to resize brand logo
export const resizeBrandLogo = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) return next();

    // Resize and format the brand logo
    req.file.filename = `brand-${Date.now()}-logo.jpeg`;

    await sharp(req.file.buffer)
      .resize(500, 500) // Resize to 500x500 pixels
      .toFormat('jpeg')
      .jpeg({ quality: 90 });

    next();
  }
);

// Middleware to upload brand logo to Cloudinary
export const uploadBrandLogoToCloudinary = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) return next();

    // Upload the brand logo to Cloudinary
    const result = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
      {
        folder: 'uploads/brands', // Folder in Cloudinary
      }
    );

    req.body.brandLogo = result.secure_url; // Save the Cloudinary URL
    next();
  }
);

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
    
    // If there's a new logo from Cloudinary, it's already in req.body.brandLogo

    // Update the brand
    const updatedBrand = await Brand.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true, 
        runValidators: true 
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