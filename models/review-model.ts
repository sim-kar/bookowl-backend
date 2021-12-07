import mongoose from 'mongoose';
import IReview from '../services/IReview';

const reviewSchema = new mongoose.Schema<IReview>({
  isbn: String,
  username: String,
  stars: Number,
  text: String,
  date: String, // yyyy-mm-dd. TODO: validation
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
});

const Review = mongoose.model<IReview>('Review', reviewSchema);

export default Review;
