import { Request, Response, NextFunction } from "express";
import { User, IUser } from "../models/userModel"; 
import { Item } from "../models/itemModel"; 
import asyncHandler from "../utils/catchAsyncError";
import { AppError } from "../utils/appError";
import multer from 'multer';
import path from "path";
import sharp from 'sharp'
import cloudinary from "../configs/cloudinaryConfig";

const multerStorage = multer.memoryStorage()

function multerFilter(req: Request, file: Express.Multer.File, cb: Function) {
  if (file.mimetype.startsWith('image')) cb(null, true);
  else cb(new AppError('not an image! please upload only images.', 400), false);
}

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

export const uploadUserphoto = upload.single('avatarFile');

export const resizeUserPhoto = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {    
    
    if(!req.file){
      return next()
    }

    req.file.filename = `user-${req.user?.id}-${Date.now()}.jpeg`;

    const uploadsDir = path.join(__dirname, "..", "uploads");

    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      //.toFile(`${uploadsDir}/${req.file.filename}`);

    next();
  }
);
export const uploadUserPhotoToCloudinary = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {


    if(!req.file){
      return next()
    }

    const result = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
      {
        folder: 'uploads/users',
      }
    );

    req.file.filename = result.url
    next()
  }
);



// A filter function to extract text fileds needs to be updated from req.body
const filterObj = <T extends Record<string, any>>(
  obj: T,
  ...allowedFields: (keyof T)[]
): Partial<T> => {
  const newObj: Partial<T> = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el as keyof T)) {
      newObj[el as keyof T] = obj[el];
    }
  });
  return newObj;
};

export const updateMe = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {

      const filedsToBeUpdated = filterObj(req.body, 'firstName', 'lastName', 'email', 'gender', 'phone', 'avatarFile')
      if(req.file) 
        filedsToBeUpdated.avatarFile = req.file.filename      
      
      const updatedUser = await User.findByIdAndUpdate(req.user?.id, filedsToBeUpdated, {
        new: true,
        runValidators: true,
      }).select("-password -passwordConfirm")      
      
      res.status(200).json({
        status: 'success',
        data:{
          updatedUser
        }
      })
    }
);

export const getMe = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {

    const user = await User.findById(req.user?.id).select("-password -passwordConfirm")

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    res.status(200).json({
      status: 'success',
      data:{
        user
      }
    })
  }
);

export const deleteMe = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    
    const userId = req.user?.id;
    await User.findByIdAndUpdate(userId, { active: false });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  }
);


/**
 *  Admin endpoints
**/

/**
 * Create a new user by admin
 */
export const createUserByAdmin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Extract and validate required fields
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      passwordConfirm, 
      role = 'user', 
      phone,
      gender,
    } = req.body;
    
    // Basic validation
    if (!email) return next(new AppError('Email is required!', 400));
    if (!firstName) return next(new AppError('First name is required!', 400));
    if (!lastName) return next(new AppError('Last name is required!', 400));
    if (!password) return next(new AppError('Password is required!', 400));
    
    // Validate password match
    if (password !== passwordConfirm) {
      return next(new AppError("Password and passwordConfirm do not match.", 400));
    }
    
    // Validate role
    if (role && !['user', 'seller', 'admin'].includes(role)) {
      return next(new AppError("Invalid role. Must be 'user', 'seller', or 'admin'", 400));
    }
    
    // Check if user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('User with this email already exists', 400));
    }
    
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
      passwordConfirm,
      role,
      phone,
      gender
    });
    
    // Remove sensitive data from response
    const userWithoutSensitiveData = await User.findById(newUser._id)
      .select("-password -passwordConfirm -passwordResetToken -passwordResetExpires");
    
    res.status(201).json({
      status: 'success',
      data: {
        user: userWithoutSensitiveData
      }
    });
  }
);


export const getAllUsers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Get pagination parameters from query
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const skip = (page - 1) * limit;

    // Get filter parameters
    const filter: any = {};
    
    // Filter by role if provided
    if (req.query.role && ['user', 'seller', 'admin'].includes(req.query.role as string)) {
      filter.role = req.query.role;
    }
    
    // Filter by active status if provided
    if (req.query.active !== undefined) {
      filter.active = req.query.active === 'true';
    }

    // Find users with filters, pagination and excluding sensitive data
    const users = await User.find(filter)
      .select("-password -passwordConfirm -passwordResetToken -passwordResetExpires")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Count total users matching the filter
    const totalUsers = await User.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      results: users.length,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
      data: {
        users
      }
    });
  }
);

/**
 * Update user (active status or role) 
 */
export const updateUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    
    // Only allow updating active status or role
    const allowedFields = ['active', 'role'];
    const updateData: Record<string, any> = {};
    
    // Check for valid fields
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        // Validate role if it's being updated
        if (field === 'role' && !['user', 'seller', 'admin'].includes(req.body.role)) {
          return next(new AppError("Invalid role. Must be 'user', 'seller', or 'admin'", 400));
        }
        
        updateData[field] = req.body[field];
      }
    }
    
    // Check if there are any fields to update
    if (Object.keys(updateData).length === 0) {
      return next(new AppError("No valid fields provided for update", 400));
    }
    
    // Find and update the user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      {
        new: true,
        runValidators: true
      }
    ).select("-password -passwordConfirm -passwordResetToken -passwordResetExpires");
    
    // Check if user exists
    if (!updatedUser) {
      return next(new AppError("User not found", 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  }
);

/**
 * Delete user (permanent deletion) 
 */
export const deleteUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    
    // Find and remove the user
    const user = await User.findByIdAndDelete(userId);
    
    // Check if user exists
    if (!user) {
      return next(new AppError("User not found", 404));
    }
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  }
);