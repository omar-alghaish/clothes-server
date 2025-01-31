import { Request, Response, NextFunction } from "express";
import { Item, IItem } from "../models/itemModel";
import asyncHandler from "../utils/catchAsyncError";
import { AppError } from "../utils/appError";
import { IUser } from "../models/userModel"; 

export const getAllItems = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const items = await Item.find();

    if (items.length === 0) {
      return next(new AppError("No items found", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        items,
      },
    });
  }
);

export const getOneItem = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return next(new AppError("No item found", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        item,
      },
    });
  }
);

export const createItem = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Extract the item details from the request body
    const { name, description, sizes, price, images } = req.body;

    // Extract the seller ID from the authenticated user
    const sellerId = (req.user as IUser)._id; // Assuming req.user is populated by the authentication middleware

    // Create the new item with the seller ID
    const newItem = await Item.create({
      name,
      description,
      sizes,
      price,
      images,
      seller: sellerId, // Add the seller ID to the item
    });
    
    await Item.create(newItem);
    res.status(201).json({
      status: "success",
      message: "item was added successfully!",
    });
  }
);

export const updateItem = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {

    const item = await Item.findById(req.params.id);
    if (!item) {
      return next(new AppError("No item found with that ID", 404));
    }

    // Verify ownership
    if (!(await Item.verifyOwner(item as IItem, req.user?._id as string))) {
      return next(new AppError("You do not have permission to perform this action!", 403));
    }
    
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedItem)
      return next(new AppError("No document found with that ID", 404));

    res.status(200).json({
      status: "success",
      data: updatedItem,
    });
  }
);

export const deleteItem = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {

    const item = await Item.findById(req.params.id);
    if (!item) {
      return next(new AppError("No item found with that ID", 404));
    }

    // Verify ownership
    if (!(await Item.verifyOwner(item as IItem, req.user?._id as string))) {
      return next(new AppError("You do not have permission to perform this action!", 403));
    }

    const itemToDelete = await Item.findByIdAndDelete(req.params.id);

    if (!itemToDelete) {
      return next(new AppError("No item found with that ID", 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  }
);
