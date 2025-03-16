import mongoose, { Schema, Document } from 'mongoose';

// Define the Review interface
interface IReview extends Document {
  user: mongoose.Schema.Types.ObjectId; 
  item: mongoose.Schema.Types.ObjectId; 
  rating: number; 
  comment: string;
}

const reviewSchema: Schema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item', 
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1, 
    max: 5, 
  },
  comment: {
    type: String,
    required: true,
    trim: true,
  }
},  
{
  timestamps: true, 
});

const Review = mongoose.model<IReview>('Review', reviewSchema);

export default Review;