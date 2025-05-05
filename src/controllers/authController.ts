import { Request, Response, NextFunction } from "express";
import { User, IUser } from "../models/userModel"; 
import { Brand, IBrand } from "../models/brandModel"; 
import { Item } from "../models/itemModel"; 
import asyncHandler from "../utils/catchAsyncError";
import { AppError } from "../utils/appError";
import jwt from "jsonwebtoken";
import multer from 'multer';
import path from "path";
import sharp from 'sharp'
import cloudinary from "../configs/cloudinaryConfig";
import crypto from 'crypto';
import { sendEmail } from '../utils/email';

const signToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user: IUser, status: number, res: Response, brand?: IBrand): void => {
  
  const token = signToken(user.id);

  let newUser;
  if(user.role === "user"){
    newUser = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    }
  }
  else if (user.role === "seller" && user.brand) {
    newUser = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      brand: brand
    }
  }

  res.status(status).json({
    status: "success",
    token,
    data: {
      newUser,
    },
  });
};

// Middleware to upload brand logo

const multerStorage = multer.memoryStorage()

function multerFilter(req: Request, file: Express.Multer.File, cb: Function) {
  if (file.mimetype.startsWith('image')) cb(null, true);
  else cb(new AppError('not an image! please upload only images.', 400), false);
}

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

export const uploadBrandLogo = upload.single('brandLogo');

export const resizeBrandLogo = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    
    if (!req.file) return next();

    // Resize and format the brand logo
    req.file.filename = `brand-${Date.now()}-logo.jpeg`;

    await sharp(req.file.buffer)
      .resize(500, 500) // Resize to 500x500 pixels (adjust as needed)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      //.toFile(path.join(__dirname, '..', 'uploads', req.file.filename)); // Uncomment if saving locally

    req.body.brandLogo = req.file.filename; // Save the filename for Cloudinary upload
    next();
  }
);

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


export const signUp = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // const {firstName, lastName, email, password} = req.body
  
    
    const { firstName, lastName, email, password, passwordConfirm, role, brandName, brandDescription, brandStyle, brandLogo,
      primaryColor, businessAddress, phoneNumber, website, taxId } = req.body;
      
    if(!email) 
      return next(new AppError('email is required!', 400));
    if(!firstName)
      return next(new AppError('firstName is required!', 400));
    if(!lastName) 
      return next(new AppError('lastName is required!', 400));
    if(!password)
      return next(new AppError('password is required!', 400));

    if (role === "seller" && (!brandName || !brandDescription || !brandStyle || !brandLogo ||
      !primaryColor || !businessAddress || !phoneNumber || !taxId)) {
        return next(new AppError('Brand details are required for seller registration!', 400));
    }
    
    if (password !== passwordConfirm) {
      return next(new AppError("password and passwordConfirm do not match.", 400));
    }
    const newUser = await User.create({
      firstName, lastName, email, password, passwordConfirm, role
    });

    let brand;    
    if(role === "seller"){
        brand = await Brand.create({
        brandName, brandDescription, brandStyle, brandLogo, primaryColor, businessAddress, phoneNumber,
        website, taxId, user: newUser.id
      })
      //add the brand id to the user object (newUser.brand)      
      newUser.brand = brand.id
      //console.log(newUser.brand);      
      newUser.save({ validateBeforeSave: false })
    }
    
    createSendToken(newUser, 201, res, brand);
  }
);

export const signIn = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      return next(new AppError("Please provide email and password!", 400));
    }

    // Find user by email and select the password field explicitly
    const existingUser = await User.findOne({ email }).select("+password");

    // Check if user exists and password is correct
    if (!existingUser || !(await existingUser.comparePassword(password))) {
      return next(new AppError("Incorrect email or password", 401));
    }

    // Send token
    // createSendToken(existingUser, 200, res);
    let userWithoutSensitiveData;

    if(existingUser.role == 'seller' && existingUser.brand){
      userWithoutSensitiveData = {
        firsName: existingUser.firstName,
        lastName: existingUser.lastName,
        email: existingUser.email,
        avatarFile: existingUser.avatarFile,
        role: existingUser.role,
        brand: existingUser.brand
      }
    }
    else{
      userWithoutSensitiveData = {
        firsName: existingUser.firstName,
        lastName: existingUser.lastName,
        email: existingUser.email,
        avatarFile: existingUser.avatarFile,
        role: existingUser.role
      }  
    }

    const token = signToken(existingUser.id);
    res.status(200).json({
      status: "success",
      token,
      data: {
        userWithoutSensitiveData,
      },
    }); 
  }
);

export const changePassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Get user from collection
    const user = await User.findById(req.user?.id).select('+password');
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // 2) Check if POSTed current password is correct
    const { currentPassword, newPassword, newPasswordConfirm } = req.body;
    

    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      return next(
        new AppError('Please provide current password, new password and password confirmation', 400)
      );
    }

    // Verify current password
    const isPasswordCorrect = await user.comparePassword(currentPassword);
    if (!isPasswordCorrect) {
      return next(new AppError('Your current password is incorrect', 401));
    }

    // 3) Check if new password and confirmation match
    if (newPassword !== newPasswordConfirm) {
      return next(new AppError('New password and confirmation do not match', 400));
    }

    // 4) If so, update password
    user.password = newPassword;
    user.passwordConfirm = newPasswordConfirm;
    await user.save();
    // Password will be hashed by the pre-save middleware

    // 5) Log user in, send JWT
    createSendToken(user, 200, res);
  }
);



export const forgotPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(new AppError('There is no user with that email address.', 404));
    }

    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send it to user's email
    // For production environment, replace the URL with your actual frontend URL
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 min)',
        message
      });

      res.status(200).json({
        status: 'success',
        message: 'Token sent to email!'
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new AppError('There was an error sending the email. Try again later!', 500)
      );
    }
  }
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() }
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
      return next(new AppError('Token is invalid or has expired', 400));
    }

    // 3) Update password and remove reset token fields
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    // 4) Save the user - this will trigger the pre-save hook to hash the password
    await user.save();

    // 5) Log the user in, send JWT
    createSendToken(user, 200, res);
  }
);


// Extend the Request interface to include the `user` property
declare module 'express' {
  interface Request {
    user?: IUser; // Use IUser instead of User
  }
}

// Interface for the decoded token
interface DecodedToken {
  id: string;
  // Add other properties if needed
}

// Custom promisified version of jwt.verify
const verifyToken = (token: string, secret: string): Promise<DecodedToken> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
      console.log(err);
        return reject(err);
      }
      resolve(decoded as DecodedToken); // Cast the decoded payload to DecodedToken
    });
  });
};

export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {  
  // 1) Checking if the token exists
  
  let token: string | undefined = req.headers.authorization;

  if (!token || !token.startsWith('Bearer')) {
    return next(new AppError('You are not logged in! Please log in first.', 401)); // 401 => unprotectd
  }  
  
  token = token.split(' ')[1];
  
  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }
  
  // 2) Verification token
  const decoded = await verifyToken(token, "THIS_IS_SECRET_KEY");
  // 3) Check if user still exists  
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token does no longer exist.', 401));
  }
  
  // Attach the user to the request object for further use in the route handlers
  req.user = currentUser;

  // Grant access to the protected route
  next();
});

export const restrictTo = (...roles: string[]) => {
  
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if the user's role is included in the allowed roles
    
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have the permission to perform this action', 403)
      );
    }

    // Grant access to the protected route
    next();
  };
};

export const getSellerItems = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Extract the seller ID from the authenticated user
    const sellerId = (req.user as IUser)._id;

    // Fetch all items where the seller field matches the seller ID
    const items = await Item.find({ seller: sellerId });

    // Send the response
    res.status(200).json({
      status: "success",
      results: items.length,
      data: items,
    });
  }
);






