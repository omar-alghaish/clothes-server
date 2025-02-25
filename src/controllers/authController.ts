import { Request, Response, NextFunction } from "express";
import { User, IUser } from "../models/userModel"; 
import { Item } from "../models/itemModel"; 
import asyncHandler from "../utils/catchAsyncError";
import { AppError } from "../utils/appError";

import jwt from "jsonwebtoken";

const signToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user: IUser, status: number, res: Response): void => {
  const token = signToken(user.id);

  const userWithoutSensitiveData = {
    name: user.name,
    email: user.email,
    role: user.role,
    photo: user.photo
  };

  res.status(status).json({
    status: "success",
    token,
    data: {
      userWithoutSensitiveData,
    },
  });
};

export const signUp = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
      photo: req.file?.filename, 
      password: req.body.password,
    });

    createSendToken(newUser, 201, res);
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
    createSendToken(existingUser, 200, res);
  }
);


export const forgotPassword = asyncHandler(
  async (req: Request, res: Response, next: Function) => {}
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response, next: Function) => {}
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