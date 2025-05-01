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

