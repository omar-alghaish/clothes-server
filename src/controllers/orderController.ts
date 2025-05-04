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
    const { addressId, paymentId, paymentData } = req.body;
    const userId = req.user?.id;

    // Validate required fields
    if (!addressId) {
      return next(new AppError("Address ID is required.", 400));
    }
    if (!paymentId) {
      return next(new AppError("Payment ID is required.", 400));
    }

    // Fetch the user's cart
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return next(new AppError("Your cart is empty.", 400));
    }

    // Fetch the address
    const address = await Address.findById(addressId);
    if (!address) {
      return next(new AppError("Address not found.", 404));
    }

    // Calculate the subTotal (sum of all items' prices)
    let subTotal = 0;
    for (const item of cart.items) {
      subTotal += item.quantity * item.price;
    }

    // Calculate shipping and tax as a fixed percentage of the subTotal
    const shipping = subTotal * 0.05; 
    const tax = subTotal * 0.07; 

    // Calculate the totalPrice (subTotal + shipping + tax)
    const totalPrice = subTotal + shipping + tax;

    // Handle payment data
    let paymentMethodId;
    
      const payment = await PaymentCard.findById(paymentId);
      if (!payment) {
        return next(new AppError("Payment not found.", 404));
      }
      paymentMethodId = paymentId;

    // Calculate estimated delivery date (3 days from now)
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + 3);

    // Create the order
    const order = await Order.create({
      user: userId,
      items: cart.items.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        color: item.color,
        brand: item.brand
      })),
      shipping,
      tax,
      subTotal,
      totalPrice,
      shippingAddress: addressId, 
      paymentMethod: paymentMethodId, 
      estimatedDate
    });

    // Clear the cart
    cart.items = []; 
    cart.totalPrice = 0;
    await cart.save();

    // Populate order with additional item and brand details before sending response
    const populatedOrder = await Order.findById(order._id)
      .populate({
        path: "items.product",
        model: "Item",
        select: "name img"
      })
      .populate({
        path: "items.brand",
        model: "Brand",
        select: "brandName brandLogo"
      });

    // Send the response
    res.status(201).json({
      status: "success",
      data: {
        order: populatedOrder,
      },
    });
  }
);

export const getMyOrders = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
      
      const userId = req.user?.id
      
      const orders = await Order.find({user: userId})
        .populate({
          path: "items.product",
          model: "Item",
          select: "name img"
        })
        .populate({
          path: "items.brand",
          model: "Brand",
          select: "brandName brandLogo"
        });

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
      const orderId = req.params.id
      const order = await Order.findOne({_id: orderId})
        .populate({
          path: "items.product",
          model: "Item",
          select: "name img"
        })
        .populate({
          path: "items.brand",
          model: "Brand",
          select: "brandName brandLogo"
        });
  
      if (!order)
          return next(new AppError('No orders found', 404));

      res.status(200).json({
          status: "success",
          data: order,
      });
  }
);

export const getSellerOrders = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const sellerId = req.user?.id;
    
    // Get the seller's brand ID
    const seller = await User.findById(sellerId);
    if (!seller || !seller.brand) {
      return next(new AppError("Seller or brand not found", 404));
    }
    
    const brandId = seller.brand;
    
    // Find orders containing items from this seller's brand
    const orders = await Order.find({
      "items.brand": brandId
    }).populate([
      { path: "user", select: "firstName lastName email" },
      { path: "shippingAddress" },
      { path: "items.product", model: "Item" }, 
    ]);
    
    if (orders.length === 0) {
      return next(new AppError("No orders found for your brand", 404));
    }
    
    res.status(200).json({
      status: "success",
      results: orders.length,
      data: {
        orders
      }
    });
  }
);

export const updateSellerOrder = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { orderId, status } = req.body;
    const sellerId = req.user?.id;
    
    // Input validation
    if (!orderId) {
      return next(new AppError("Order ID is required", 400));
    }
    
    if (!status || !['pending', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return next(new AppError("Valid status is required (pending, shipped, delivered, or cancelled)", 400));
    }
    
    // Get the seller's brand ID
    const seller = await User.findById(sellerId);
    if (!seller || !seller.brand) {
      return next(new AppError("Seller or brand not found", 404));
    }
    
    const brandId = seller.brand;
    
    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return next(new AppError("Order not found", 404));
    }
    
    // Check if the order contains items from this seller's brand
    const hasBrandItems = order.items.some(item => 
      item.brand && item.brand.toString() === brandId.toString()
    );
    
    if (!hasBrandItems) {
      return next(new AppError("This order doesn't contain items from your brand", 403));
    }
    
    // Update the order status
    order.status = status;
    await order.save();
    
    // Send success response
    res.status(200).json({
      status: "success",
      message: `Order status updated to ${status}`,
      data: {
        order
      }
    });
  }
);