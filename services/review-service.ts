import Book from '../models/book-model';
import Review from '../models/review-model';
import User from '../models/user-model';
import DateUtils from '../utils/DateUtils';

export default class ReviewService {
  // get all reviews
  static async getReviews() {
    return {
      statusCode: 200,
      reviews: await Review.find({}, ['-_id', '-__v'])
        .populate({ path: 'book' }),
    };
  }

  // get a review by isbn and username
  static async getReview(isbn: string, username: string) {
    const foundReview = await Review.findOne({ isbn, username }, ['-_id', '-__v'])
      .populate({ path: 'book' });

    if (!foundReview) {
      // FIXME: use 204 No Content with empty data instead of 404?
      // see discussion here: https://stackoverflow.com/questions/11746894/what-is-the-proper-rest-response-code-for-a-valid-request-but-an-empty-data
      return { statusCode: 204, review: {} };
    }

    return { statusCode: 200, review: foundReview };
  }

  // add a review
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
      // get the date in yyyy-mm-dd format
      date: DateUtils.formatDate(new Date()),
      book: foundBook._id,
    });

    try {
      await newReview.save();
    } catch (error) {
      console.error(error);
      return { statusCode: 500, message: { error: 'Unable to add review.' } };
    }

    return { statusCode: 201, message: { message: 'Added review.' } };
  }

  // update review
  static async updateReview(
    isbn: string,
    username: string,
    stars: 0 | 1 | 2 | 3 | 4 | 5,
    text: string,
  ) {
    const foundReview = await Review.findOne({ isbn, username });

    if (!foundReview) {
      // FIXME: use 204 No Content with empty data instead of 404?
      // see discussion here: https://stackoverflow.com/questions/11746894/what-is-the-proper-rest-response-code-for-a-valid-request-but-an-empty-data
      return { statusCode: 404, message: { error: "Review doesn't exist." } };
    }

    // get date in yyyy-mm-dd format
    foundReview.date = DateUtils.formatDate(new Date());
    foundReview.stars = stars;
    foundReview.text = text;

    try {
      await foundReview.save();
    } catch (error) {
      // FIXME: is 500 Internal Sever Error the correct code? 'the server encountered an unexpected
      //  condition that prevented it from fulfilling the request'
      return { statusCode: 500, message: { error: 'Unable to update review.' } };
    }

    return { statusCode: 200, message: { message: 'Updated review' } };
  }

  // delete review
  static async deleteReview(isbn: string, username: string) {
    try {
      const deletedReview = await Review.findOneAndDelete({ isbn, username });

      if (!deletedReview) {
        return { statusCode: 404, message: { error: "Review doesn't exist." } };
      }
    } catch (error) {
      // FIXME: is 500 Internal Sever Error the correct code? 'the server encountered an unexpected
      //  condition that prevented it from fulfilling the request'
      return { statusCode: 500, message: { error: 'Unable to delete review.' } };
    }

    return { statusCode: 200, message: { message: 'Deleted review' } };
  }
}
