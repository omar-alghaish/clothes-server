import { Request, Response, NextFunction } from "express";
import { Item, IItem } from "../models/itemModel";
import asyncHandler from "../utils/catchAsyncError";
import { AppError } from "../utils/appError";
import { IUser } from "../models/userModel"; 
import cloudinary from "../configs/cloudinaryConfig";
import multer from "multer";
import sharp from "sharp";
import { log } from "util";

const multerStorage = multer.memoryStorage()

function multerFilter(req: Request, file: Express.Multer.File, cb: Function) {
  if (file.mimetype.startsWith('image')) cb(null, true);
  else cb(new AppError('not an image! please upload only images.', 400), false);
}
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

export const uploaditemImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

export const resizeitemImages = asyncHandler(async (req, res, next) => {
  // Ensure req.files exists and has the expected structure
  if (!req.files || !('imageCover' in req.files) || !('images' in req.files)) {
    return next();
  }

  // 1) Cover image
  req.body.imageCover = `item-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`uploads/img/items/${req.body.imageCover}`);

  // 2) Images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `item-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`uploads/img/items/${filename}`);

      req.body.images.push(filename);
    })
  );

  next();
}); 


export const getAllItems = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {

    const { page, category, gender, color, size, brand, price } = req.query;

    const filter: any = {};
 
    if (category) {
      const [gender, itemCategory] = (category as string).split("-");
      filter.category = itemCategory;
      filter.gender = gender; 
    }

    if (color) {
      filter.colors = { $in: (color as string).split(",") };
    }

    if (size) {
      filter.sizes = { $in: (size as string).split(",") }; 
    }

    if (brand) {
      filter.brand = { $in: (brand as string).split(",") };
    }

    if (price) {
      const [minPrice, maxPrice] = (price as string).split("-");
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Pagination
    const limit = 10; 
    const skip = (parseInt(page as string) - 1) * limit;

    // Fetch items
    const items = await Item.find(filter)
      .skip(skip)
      .limit(limit);

    // Count total items for pagination
    const totalItems = await Item.countDocuments(filter);

    res.status(200).json({
      status: "success",
      results: items.length,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: parseInt(page as string),
      data: {
        items,
      },
    });
  }
);

export const getNewArrivals = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Calculate the date 7 days ago
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Fetch items created within the last 7 days
    const newArrivals = await Item.find({
      createdAt: { $gte: sevenDaysAgo }, 
    }).sort({ createdAt: -1 }); 

    if (newArrivals.length === 0) {
      return next(new AppError("No new arrivals found", 404));
    }

    // Send the response
    res.status(200).json({
      status: "success",
      results: newArrivals.length,
      data: {
        items: newArrivals,
      },
    });
  }
);

export const getFeaturedItems = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {

    const featuredItems = await Item.find({ featured: true }).sort({ createdAt: -1 });

    if (featuredItems.length === 0) {
      return next(new AppError("No featured items found", 404));
    }

    res.status(200).json({
      status: "success",
      results: featuredItems.length,
      data: {
        items: featuredItems,
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
