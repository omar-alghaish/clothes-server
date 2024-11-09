import { Request, Response, NextFunction } from "express";
import { item } from "../models/itemModel";
import asyncHandler from "../utils/catchAsyncError";
import { AppError } from "../utils/appError";

export const getAllItems = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const items = await item.find();

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

export const createItem = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const newItem = req.body;
    await item.create(newItem);
    res.status(200).json({
      status: "success",
      message: "item was added successfully!",
    });
  }
);

export const updateItem = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const itemToUpdate = await item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!itemToUpdate)
      return next(new AppError("No document found with that ID", 404));

    res.status(200).json({
      status: "success",
      data: itemToUpdate,
    });
  }
);

export const deleteItem = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const itemToDelete = await item.findByIdAndDelete(req.params.id);

    if (!itemToDelete) {
      return next(new AppError("No item found with that ID", 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  }
);
