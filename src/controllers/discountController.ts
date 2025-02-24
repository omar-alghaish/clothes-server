import { Request, Response, NextFunction } from "express";
import Discount from "../models/discountModel";

// Create a new discount coupon
export const createDiscount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      code,
      description,
      discountPercentage,
      discountAmount,
      startDate,
      endDate,
      maxUses,
    } = req.body;

    // Check if coupon already exists
    const existing = await Discount.findOne({ code });
    if (existing) {
      res.status(400).json({ message: "Discount code already exists" });
      return;
    }

    const discount = await Discount.create({
      code,
      description,
      discountPercentage,
      discountAmount,
      startDate,
      endDate,
      maxUses,
    });

    res.status(201).json(discount);
  } catch (error) {
    next(error);
  }
};

// Retrieve a discount coupon by its code
export const getDiscount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code } = req.params;
    const discount = await Discount.findOne({ code });
    if (!discount) {
      res.status(404).json({ message: "Discount code not found" });
      return;
    }
    res.json(discount);
  } catch (error) {
    next(error);
  }
};

// Update a discount coupon by its code
export const updateDiscount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code } = req.params;
    const updateData = req.body;
    const discount = await Discount.findOneAndUpdate({ code }, updateData, {
      new: true,
    });
    if (!discount) {
      res.status(404).json({ message: "Discount code not found" });
      return;
    }
    res.json(discount);
  } catch (error) {
    next(error);
  }
};

// Delete a discount coupon by its code
export const deleteDiscount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code } = req.params;
    const discount = await Discount.findOneAndDelete({ code });
    if (!discount) {
      res.status(404).json({ message: "Discount code not found" });
      return;
    }
    res.json({ message: "Discount code deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Apply a discount coupon
export const applyDiscount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code } = req.body;
    const discount = await Discount.findOne({ code });
    if (!discount) {
      res.status(404).json({ message: "Discount code not found" });
      return;
    }

    // Check if discount is active and within the valid date range
    const now = new Date();
    if (
      !discount.isActive ||
      discount.startDate > now ||
      discount.endDate < now
    ) {
      res.status(400).json({ message: "Discount code is expired or inactive" });
      return;
    }

    // Check if the discount has remaining uses
    if (discount.currentUses >= discount.maxUses) {
      res
        .status(400)
        .json({ message: "Discount code has reached its usage limit" });
      return;
    }

    // Increment the use count
    discount.currentUses += 1;
    await discount.save();

    res.json({ message: "Discount applied successfully", discount });
  } catch (error) {
    next(error);
  }
};
