import { Request, Response, NextFunction } from "express";
import asyncHandler from "../utils/catchAsyncError";
import { Order, IOrderItem } from "../models/orderModel";
import { User, IUser } from "../models/userModel";
import { AppError } from "../utils/appError";
import { Item, IItem } from "../models/itemModel"; 
import { Address } from "../models/addressModel"; 
import { PaymentCard } from "../models/paymentCardModel"; 
import { Cart } from "../models/cartModel"; 

export const createOrder = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { items, addressId, paymentId, paymentData } = req.body;
    const userId = req.user?.id;

    // Validate required fields
    if (!addressId || !items || items.length === 0) {
      return next(new AppError("Address ID and at least one item are required.", 400));
    }
    if (!paymentId && !paymentData) {
      return next(new AppError("Payment ID or Payment Data is required.", 400));
    }

    // Fetch the address
    const address = await Address.findById(addressId);
    if (!address) {
      return next(new AppError("Address not found.", 404));
    }

    // Calculate the subTotal (sum of all items' prices)
    let subTotal = 0;
    for (const item of items) {
      subTotal += item.quantity * item.price;
    }

    // Calculate shipping and tax as a fixed percentage of the subTotal
    const shipping = subTotal * 0.05; // 5% of subTotal
    const tax = subTotal * 0.07; // 7% of subTotal

    // Calculate the totalPrice (subTotal + shipping + tax)
    const totalPrice = subTotal + shipping + tax;

    // Fetch payment data if paymentId is provided
    let payment;
    if (paymentId) {
      payment = await PaymentCard.findById(paymentId);
      if (!payment) {
        return next(new AppError("Payment not found.", 404));
      }
    } else {
      // Use the provided paymentData
      payment = paymentData;
    }
    

    // Create the order
    const order = await Order.create({
      user: userId,
      items: items.map((item: IOrderItem) => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price,
      })),
      shipping,
      tax,
      subTotal,
      totalPrice,
      shippingAddress: address,
      paymentMethod: payment,
    });

    // If a cartId is provided, clear the cart after the order is created
    // if (req.body.cartId) {
    //   const cart = await Cart.findById(req.body.cartId);
    //   if (cart) {
    //     cart.items = [];
    //     cart.totalPrice = 0;
    //     await cart.save();
    //   }
    // }

    res.status(201).json({
      status: "success",
      data: {
        order,
      },
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
