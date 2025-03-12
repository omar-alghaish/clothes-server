import { Request, Response, NextFunction } from "express";
import { Order, IOrder } from "../models/orderModel";
import asyncHandler from "../utils/catchAsyncError";
import { AppError } from "../utils/appError";
import { Item } from "../models/itemModel"; 

export const createOrder = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
  
      const { items, shippingAddress, paymentMethod } = req.body;
      const userId = req.user?.id;

      // Calculate the total price
      let totalPrice = 0;
      for (const item of items) {
        totalPrice += item.quantity * item.price;
      }

      for (const item of items) {
        const product = await Item.findById(item.product);
        if (!product) {
          return next(new AppError(`Product with ID ${item.product} not found.`, 404));
        }
      }

      const order = await Order.create({
        user: userId,
        items,
        totalPrice,
        shippingAddress,
        paymentMethod,
      });
  
      res.status(201).json({
        status: "success",
        data: order,
      });
    }
);

export const getMyOrders = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        
        const userId = req.user?.id
        
        const orders = await Order.find({user: userId})

        if (orders.length < 1){
            return next(new AppError('No orders found', 404));
        }

        res.status(200).json({
            status: "success",
            data: orders,
        });
    }
);

export const getOrder = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        
        const userId = req.user?.id
        const orderId = req.params.id
        const order = await Order.findOne({user: userId, _id: orderId})
    

        if (!order)
            return next(new AppError('No orders found', 404));
        

        res.status(200).json({
            status: "success",
            data: order,
        });
    }
);
