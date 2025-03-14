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

export const uploadUserphoto = upload.single('photo');

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
      .toFile(`${uploadsDir}/${req.file.filename}`);

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

      const filedsToBeUpdated = filterObj(req.body, 'firstName', 'lastName', 'email', 'gender', 'phone')
      if(req.file) 
        filedsToBeUpdated.photo = req.file.filename
      
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