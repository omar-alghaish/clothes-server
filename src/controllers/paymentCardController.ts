import { Request, Response, NextFunction } from 'express';
import asyncHandler from './../utils/catchAsyncError';
import PaymentCard from '../models/paymentCardModel'; // Adjust the path to your model
import { AppError } from '../utils/appError';

export const createPaymentCard = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { cardHolderName, cardNumber, expirationDate, cvv } = req.body;
    const userId = req.user?._id; 

    // Validate required fields
    if (!cardHolderName || !cardNumber || !expirationDate || !cvv){
        return next(new AppError('All card fields are required', 404));
    }

    // Create the payment card
    const paymentCard = await PaymentCard.create({
      cardHolderName,
      cardNumber,
      expirationDate,
      cvv,
      user: userId, 
    });

    res.status(201).json({
      status: 'success',
      data: {
        paymentCard,
      },
    });
  }
);

export const getPaymentCards = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id; 

    const paymentCards = await PaymentCard.find({user: userId})

    if(paymentCards.length < 1 ){
      return next(new AppError('no payment cards found', 404));
    }

    res.status(201).json({
      status: 'success',
      results: paymentCards.length,
      data: {
        paymentCards,
      },
    });
  }
);

export const deletePayment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user?._id;

    // Find the payment card
    const paymentCard = await PaymentCard.findById(id);

    // Check if payment card exists
    if (!paymentCard) {
      return next(new AppError('Payment card not found', 404));
    }

    // Verify that the payment card belongs to the authenticated user
    if (paymentCard.user.toString() !== userId?.toString()) {
      return next(new AppError('You do not have permission to delete this payment card', 403));
    }

    // Delete the payment card
    await PaymentCard.findByIdAndDelete(id);

    // Return no content status
    res.status(204).json({
      status: 'success',
      data: null
    });
  }
);