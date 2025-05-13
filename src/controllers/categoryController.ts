import { Request, Response, NextFunction } from "express";
import { Category, ICategory } from "../models/categoryModel";
import asyncHandler from "../utils/catchAsyncError";
import { AppError } from "../utils/appError";
import { Item } from "../models/itemModel";

// Get all categories
export const getAllCategories = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { active, gender, parent } = req.query;
    
       
    const categories = await Category.find().sort({ name: 1 });
    
    res.status(200).json({
      status: "success",
      results: categories.length,
      data: {
        categories,
      },
    });
  }
);

// Get one category by ID
export const getCategory = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return next(new AppError("No category found with that ID", 404));
    }
    
    res.status(200).json({
      status: "success",
      data: {
        category,
      },
    });
  }
);

// Create a new category (Admin only)
export const createCategory = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, description, isActive, gender } = req.body;
    
    // Create the new category
    const newCategory = await Category.create({
      name,
      description,
      isActive: isActive !== undefined ? isActive : true,
      gender
    });
    
    res.status(201).json({
      status: "success",
      data: {
        category: newCategory,
      },
    });
  }
);

// Update a category (Admin only)
export const updateCategory = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, description, isActive, gender } = req.body;
    
    // Check if the category exists
    const category = await Category.findById(req.params.id);
    if (!category) {
      return next(new AppError("No category found with that ID", 404));
    }
    
    // Update the category
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        isActive: isActive !== undefined ? isActive : category.isActive,
        gender: gender !== undefined ? gender : category.gender
      },
      {
        new: true,
        runValidators: true,
      }
    );
    
    res.status(200).json({
      status: "success",
      data: {
        category: updatedCategory,
      },
    });
  }
);

// Delete a category (Admin only)
export const deleteCategory = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {

    const category = await Category.findById(req.params.id);
    if (!category) {
      return next(new AppError("No category found with that ID", 404));
    }
    
    // Check if there are items using this category
    const itemsUsingCategory = await Item.countDocuments({ category: req.params.id });
    if (itemsUsingCategory > 0) {
      return next(new AppError("Cannot delete category that has items. Deactivate it instead.", 400));
    }
    
    // Delete the category
    await Category.findByIdAndDelete(req.params.id);
    
    res.status(204).json({
      status: "success",
      data: null,
    });
  }
);