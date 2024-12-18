import { Request, Response, NextFunction } from "express";
import { user as User, IUser } from "../models/userModel";
import asyncHandler from "../utils/catchAsyncError";
import { AppError } from "../utils/appError";
import jwt from "jsonwebtoken";

const signToken = (id: string): string => {
  return jwt.sign({ id }, "THIS_IS_SECRET_KEY", {
    expiresIn: "60d",
  });
};

const createSendToken = (user: IUser, status: number, res: Response): void => {
  const token = signToken(user.id);

  const userWithoutSensitiveData = {
    name: user.name,
    email: user.email,
    role: user.role,
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
      // photo: req.body.photo,  // Uncomment if photo handling is added
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
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
