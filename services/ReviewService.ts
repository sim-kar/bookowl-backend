import Book from '../models/Book';
import Review from '../models/Review';
import User from '../models/User';

/** Provides access to reviews in the database. */
export default class ReviewService {
  /**
   * Get all reviews.
   *
   * @returns the HTTP status code and reviews.
   */
  static async getReviews() {
    return {
      statusCode: 200,
      reviews: await Review.find({}, ['-_id', '-__v'], { sort: { date: -1 } })
        .populate({ path: 'book' }),
    };
  }

  /**
   * Get all reviews for a book.
   *
   * @param isbn the book's ISBN.
   * @returns the HTTP status code and reviews.
   */
  static async getReviewsForBook(isbn: string) {
    const foundReviews = await Review.find({ isbn }, ['-_id', '-__v'])
      .populate({ path: 'book' });

    if (foundReviews.length === 0) {
      return { statusCode: 204, reviews: {} };
    }

    return { statusCode: 200, reviews: foundReviews };
  }

  /**
   * Get a review.
   *
   * @param isbn the ISBN of the book.
   * @param username the username of the user.
   */
  static async getReview(isbn: string, username: string) {
    const foundReview = await Review.findOne({ isbn, username }, ['-_id', '-__v'])
      .populate({ path: 'book' });

    if (!foundReview) {
      return { statusCode: 204, review: {} };
    }

    return { statusCode: 200, review: foundReview };
  }

  /**
   * Add a review.
   *
   * @param isbn the book's ISBN.
   * @param username the user's username.
   * @param stars the rating (0-5).
   * @param text the review's text.
   * @returns the HTTP status code and result message.
   */
  static async addReview(
    isbn: string,
    username: string,
    stars: 0 | 1 | 2 | 3 | 4 | 5,
    text: string,
  ) {
    if (await Review.exists({ isbn, username })) {
      return { statusCode: 409, message: { error: 'Review already exists.' } };
    }

    // make sure isbn and username actually exist in db
    // the book _id is needed for population
    const foundBook = await Book.findOne({ isbn }, ['_id']);
    if (!foundBook || !await User.exists({ username })) {
      return { statusCode: 404, message: { error: "Book or user doesn't exist." } };
    }

    const newReview = new Review({
      isbn,
      username,
      stars,
      text,
      date: new Date(),
      book: foundBook._id,
    });

    try {
      await newReview.save();
    } catch (error) {
      return { statusCode: 500, message: { error: 'Unable to add review.' } };
    }

    return { statusCode: 201, message: { message: 'Added review.' } };
  }

  /**
   * Update a review.
   *
   * @param isbn the book's ISBN.
   * @param username the user's username.
   * @param stars the rating (0-5).
   * @param text the review's text.
   * @returns the HTTP status code and result message.
   */
  static async updateReview(
    isbn: string,
    username: string,
    stars: 0 | 1 | 2 | 3 | 4 | 5,
    text: string,
  ) {
    const foundReview = await Review.findOne({ isbn, username });

    if (!foundReview) {
      return { statusCode: 404, message: { error: "Review doesn't exist." } };
    }

    foundReview.date = new Date();
    foundReview.stars = stars;
    foundReview.text = text;

    try {
      await foundReview.save();
    } catch (error) {
      return { statusCode: 500, message: { error: 'Unable to update review.' } };
    }

    return { statusCode: 200, message: { message: 'Updated review' } };
  }

  /**
   * Delete a review.
   *
   * @param isbn the book's isbn.
   * @param username the user's username.
   * @returns the HTTP status code and result message.
   */
  static async deleteReview(isbn: string, username: string) {
    try {
      const deletedReview = await Review.findOneAndDelete({ isbn, username });

      if (!deletedReview) {
        return { statusCode: 404, message: { error: "Review doesn't exist." } };
      }
    } catch (error) {
      return { statusCode: 500, message: { error: 'Unable to delete review.' } };
    }

    return { statusCode: 200, message: { message: 'Deleted review' } };
  }
}
