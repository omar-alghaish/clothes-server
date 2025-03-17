import { Request, Response, NextFunction } from "express";
import { Item, IItem } from "../models/itemModel";
import asyncHandler from "../utils/catchAsyncError";
import { AppError } from "../utils/appError";
import { IUser } from "../models/userModel"; 
import cloudinary from "../configs/cloudinaryConfig";
import multer from "multer";
import sharp from "sharp";
import { log } from "util";
import path from "path";
import { Brand } from "../models/brandModel";

const multerStorage = multer.memoryStorage();

function multerFilter(req: Request, file: Express.Multer.File, cb: Function) {
  if (file.mimetype.startsWith('image')) cb(null, true);
  else cb(new AppError('Not an image! Please upload only images.', 400), false);
}

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

// Middleware to upload item images
export const uploadItemImages = upload.fields([
  { name: 'img', maxCount: 1 }, // Single image for the main image field
  { name: 'images', maxCount: 5 }, // Multiple images for the images field
]);

export const resizeItemImages = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {


    if (!req.files) return next();

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    // Resize and format the main image (img)
    if (files.img) {
      const img = files.img[0]; 
      img.filename = `item-${Date.now()}-main.jpeg`;

      await sharp(img.buffer)
        .resize(800, 800) 
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        //.toFile(path.join(__dirname, '..', 'uploads', img.filename));

      req.body.img = img.filename;
    }

    // Resize and format the additional images (images)
    if (files.images) {
      req.body.images = [];
      await Promise.all(
        files.images.map(async (file, index) => {
          const filename = `item-${Date.now()}-${index + 1}.jpeg`;

          await sharp(file.buffer)
            .resize(800, 800) // Resize to 800x800 pixels
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            //.toFile(path.join(__dirname, '..', 'uploads', filename));
          req.body.images.push(filename);
        })
      );
    }
    next();
  }
);

export const uploadItemImagesToCloudinary = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.files) return next();

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Upload the main image (img) to Cloudinary
    if (files.img) {
      const img = files.img[0];
      const result = await cloudinary.uploader.upload(
        `data:${img.mimetype};base64,${img.buffer.toString('base64')}`,
        {
          folder: 'uploads/items',
        }
      );
      
      req.body.img = result.secure_url;
    }

    // Upload the additional images (images) to Cloudinary
    if (files.images) {
      req.body.images = [];
      await Promise.all(
        files.images.map(async (file) => {
          const result = await cloudinary.uploader.upload(
            `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
            {
              folder: 'uploads/items',
            }
          );
          req.body.images.push(result.secure_url);
        })
      );
    }
    next();
  }
);


// function multerFilter(req: Request, file: Express.Multer.File, cb: Function) {
//   if (file.mimetype.startsWith('image')) cb(null, true);
//   else cb(new AppError('not an image! please upload only images.', 400), false);
// }
// const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

// export const uploaditemImages = upload.fields([
//   { name: 'imageCover', maxCount: 1 },
//   { name: 'images', maxCount: 3 },
// ]);

// export const resizeitemImages = asyncHandler(async (req, res, next) => {
//   // Ensure req.files exists and has the expected structure
//   if (!req.files || !('imageCover' in req.files) || !('images' in req.files)) {
//     return next();
//   }

//   // 1) Cover image
//   req.body.imageCover = `item-${req.params.id}-${Date.now()}-cover.jpeg`;
//   await sharp(req.files.imageCover[0].buffer)
//     .resize(2000, 1333)
//     .toFormat('jpeg')
//     .jpeg({ quality: 90 })
//     .toFile(`uploads/img/items/${req.body.imageCover}`);

//   // 2) Images
//   req.body.images = [];

//   await Promise.all(
//     req.files.images.map(async (file, i) => {
//       const filename = `item-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

//       await sharp(file.buffer)
//         .resize(2000, 1333)
//         .toFormat('jpeg')
//         .jpeg({ quality: 90 })
//         .toFile(`uploads/img/items/${filename}`);

//       req.body.images.push(filename);
//     })
//   );

//   next();
// }); 


export const getAllItems = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {

    const { page, category, gender, color, size, brand, price } = req.query;

    const filter: any = {};

    // Handle category and gender 
    if (category) {
      const categories = Array.isArray(category) ? category : [category]; 

      // Initialize arrays to store genders and item categories
      const genders: string[] = [];
      const itemCategories: string[] = [];

      // Process each category value
      categories.forEach((cat) => {
        const [gender, itemCategory] = (cat as string).split("-");
        if (gender && itemCategory) {
          genders.push(gender);
          itemCategories.push(itemCategory);
        }
      });

      // Add filters for gender and category
      if (genders.length > 0) {
        filter.gender = { $in: genders }; 
      }
      if (itemCategories.length > 0) {
        filter.category = { $in: itemCategories }; 
      }
    }

    // Handle color 
    if (color) {
      const colors = Array.isArray(color) ? color : [color]; 
      filter.colors = { $in: colors };
    }

    // Handle size
    if (size) {
      const sizes = Array.isArray(size) ? size : [size]; 
      filter.sizes = { $in: sizes };      
    }

    // Handle brand 
    if (brand) {
    const brandNames = Array.isArray(brand) ? brand : [brand]; 

    // Fetch the brand IDs corresponding to the brand names
    const brands = await Brand.find({ brandName: { $in: brandNames } }).select('_id');
    
    if (brands.length > 0) {
    // Extract the brand IDs
    const brandIds = brands.map((b) => b._id);

    // Filter items by brand IDs
    filter.brand = { $in: brandIds };
    } else {
        // If no brands are found, return an empty result
        filter.brand = { $in: [] }; 
      }
  }

    //Handle price range 
    if (price) {
      const [minPrice, maxPrice] = (price as string).split("-");
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Pagination
    const limit = 10;
    const skip = (parseInt(page as string) - 1) * limit;

    // Fetch items and populate the brand field
    console.log('filter: ', filter);
    
    const items = await Item.find(filter)
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'brand', // Field to populate
        select: 'brandName brandLogo', // Fields to include from the Brand collection
      });    

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
    const item = await Item.findById(req.params.id).populate({
      path: 'brand', 
      select: 'brandName brandLogo', 
    });    

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
    // const { name, description, sizes, price, images } = req.body;

    req.body.seller = req.user?.id;
    req.body.brand = req.user?.brand
    let { sizes, colors } = req.body;
    
    if (typeof sizes === "string") {
      sizes = JSON.parse(sizes);
    }
    if (typeof colors === "string") {
      colors = JSON.parse(colors);
    }

    const newItem = new Item({ ...req.body, sizes, colors});
    await newItem.save();
    
    res.status(201).json({
      status: "success",
      data: {
        newItem
      }
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
