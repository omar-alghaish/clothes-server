import { Request, Response, NextFunction } from "express";
import { Cart, ICart } from "../models/cartModel";
import asyncHandler from "../utils/catchAsyncError";
import { AppError } from "../utils/appError";
import { IUser } from "../models/userModel"; 


export const addToCart = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        let cart = await Cart.findOne({user: req.user?.id})
        if (!cart) {
            cart = await Cart.create({ user: req.user?.id, items: [], totalPrice: 0 });
        }

        // Check if the product already exists in the cart
        const itemIndex = cart.items.findIndex(
            (item) => item.product.toString() === req.body.id
        );

        cart.items.push({ product: req.body.id, quantity: req.body.quantity, price: req.body.price});

        // const addedPrice = req.body.price * req.body.quantity
        // cart.totalPrice += addedPrice

        // cart.totalPrice = cart.items.reduce(
        //     (total, item) => total + item.quantity * item.price, 0
        // );
      
        await cart.save();
      
        res.status(200).json({
            status: "success",
            data: cart,
        });
    }
);

export const getCart = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        let cart = await Cart.findOne({user: req.user?.id})
        if (!cart) {
            cart = await Cart.create({ user: req.user?.id, items: [], totalPrice: 0 });
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

        const {productId, quantity} = req.body

        if (quantity < 1) {
            return next(new AppError("Quantity must be at least 1.", 400));
        }

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
      
        cart.items[productIndex].quantity = quantity;
        await cart.save()
        
        res.status(200).json({
            status: "success",
            data: cart,
        });
    }
);