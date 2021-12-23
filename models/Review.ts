import mongoose from 'mongoose';
import IReview from '../services/IReview';

const reviewSchema = new mongoose.Schema<IReview>({
  isbn: { type: String, required: true },
  username: { type: String, required: true },
  stars: {
    type: Number,
    min: 0,
    max: 5,
    required: true,
  },
  text: String,
  date: { type: Date, required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
});

// make the combined fields isbn and username a compound index and make the combined fields unique
reviewSchema.index({ isbn: 1, username: 1 }, { unique: true });

const Review = mongoose.model<IReview>('Review', reviewSchema);

export default Review;
