import { Request, Response, NextFunction } from "express";
import { Cart, ICart } from "../models/cartModel";
import asyncHandler from "../utils/catchAsyncError";
import { AppError } from "../utils/appError";
import { IUser, User } from "../models/userModel"; 
import { Item, IItem } from "../models/itemModel"; 


export const addToCart = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {

        const userId = req.user?.id; 
        const { id, quantity, color, size } = req.body; 
    
        // Fetch the item from the database
        const item = await Item.findById(id);
    
        if (!item) {
          return next(new AppError("Item not found", 404)); // Handle item not found
        }
    
        // Use the first size/color if not provided in the request
        const selectedSize = size || item.sizes[0]; 
        const selectedColor = color || item.colors[0]; 


        let cart = await Cart.findOne({ user: userId });
    
        if (!cart) {
          cart = await Cart.create({ user: userId, items: [], totalPrice: 0 });
        }
    
        // Check if the item with the same product ID, color, and size already exists in the cart
        const itemIndex = cart.items.findIndex(
          (item) =>
            item.product.toString() === id &&
            item.color === color &&
            item.size === size
        );
        
        if (itemIndex > -1) {
          // If the item exists, update its quantity
          cart.items[itemIndex].quantity += Number(quantity);
        } else {
          // If the item doesn't exist, add it to the cart
          cart.items.push({
            product: id,
            quantity,
            price: item.price,
            size: selectedSize,
            color: selectedColor,
            brand: item.brand,
            img: item.img
          });
        }
    
        // Recalculate the total price of the cart
        cart.totalPrice = cart.items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
        
        await cart.save();
      
        res.status(200).json({
            status: "success",
            data: cart,
        });
    }
);

export const getCart = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?.id; 
  
      // Find the user's cart or create a new one if it doesn't exist
      let cart = await Cart.findOne({ user: userId })
        .populate({
          path: 'items.product', 
          select: 'name img', 
        })
        .populate({
          path: 'items.brand',
          select: 'brandName', 
        });
  
      if (!cart) {
        cart = await Cart.create({ user: userId, items: [], totalPrice: 0 });
      }
  
      res.status(200).json({
        status: "success",
        data: cart,
      });
    }
  );

export const removeFromCart = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {

        const productId = req.params.id 
        let cart = await Cart.findOne({user: req.user?.id})
        
        if(!cart){
            return next(new AppError('Cart not found!.', 404));
        }
        const updatedItems = cart.items.filter(item => item.product.toString() !== productId);

        if (updatedItems.length === cart.items.length){ 
            return next(new AppError('Product was not foundin the cart!.', 404));
        }

        cart.items = updatedItems
        await cart.save()

        res.status(204).json({
        status: "success",
        data: null,
        });
    }
);

export const updateProductQuantity = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {

        const {productId, change} = req.body

        
        let cart = await Cart.findOne({user: req.user?.id})

        if (!cart) {
            return next(new AppError('Cart not found!.', 404));
        }

        const productIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId
        );
          if (productIndex === -1) {
            return next(new AppError("Product not found in the cart.", 404));
        }
      
        if(change === 'increase')
            cart.items[productIndex].quantity += 1;
        else if(change === 'decrease')
            cart.items[productIndex].quantity -= 1;
        
        await cart.save()
        
        res.status(200).json({
            status: "success",
            data: cart,
        });
    }
);

export const clearCart = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?.id; // Get the user ID from the request
  
      // Find the user's cart
      const cart = await Cart.findOne({ user: userId });
  
      if (!cart) {
        return next(new AppError("Cart not found", 404)); // Handle cart not found
      }
  
      // Clear the items array and reset the total price
      cart.items = [];
      cart.totalPrice = 0;
  
      // Save the updated cart
      await cart.save();
  
      res.status(200).json({
        status: "success",
        data: cart,
      });
    }
  );