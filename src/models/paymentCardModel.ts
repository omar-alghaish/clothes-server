import mongoose, { Schema, Document } from 'mongoose';

interface IPaymentCard extends Document {
  cardHolderName: string;
  cardNumber: string;
  expirationDate: string;
  cvv: string;
  user: mongoose.Schema.Types.ObjectId; 
}

const paymentCardSchema: Schema = new Schema({
  cardHolderName: {
    type: String,
    required: [true, 'Card holder name is required'],
  },
  cardNumber: {
    type: String,
    required: [true, 'Card number is required'],
    unique: true, 
  },
  expirationDate: {
    type: String,
    required: [true, 'Expiration date is required'],
  },
  cvv: {
    type: String,
    required: [true, 'CVV is required'],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
  },
},
{
    timestamps: true, 
});




export const PaymentCard = mongoose.model<IPaymentCard>('PaymentCard', paymentCardSchema);

export default PaymentCard;