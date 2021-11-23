import fs from 'fs/promises';
import data from '../test-db.json';
import Review from './Review';

export default class ReviewService {
  private file: string;
  private reviews: Array<Review>;

  constructor() {
    this.file = '../test-db.json';
    this.reviews = data.reviews;
  }

  // get all reviews
  async getReviews() {
    return { statusCode: 200, reviews: this.reviews };
  }

  // get a review by isbn and username
  async getReview(isbn: string, username: string) {
    const foundReview = await this.#findReview(isbn, username);

    if (!foundReview) {
      // FIXME: use 204 No Content with empty data instead of 404?
      // see discussion here: https://stackoverflow.com/questions/11746894/what-is-the-proper-rest-response-code-for-a-valid-request-but-an-empty-data
      return { statusCode: 204, review: {} };
    }

    return { statusCode: 200, review: foundReview };
  }

  // add a review
  async addReview(isbn: string, username: string, stars: 0 | 1 | 2 | 3 | 4 | 5, text: string) {
    const foundReview = await this.#findReview(isbn, username);

    if (foundReview) {
      return { statusCode: 409, message: { error: 'Review already exists.' } };
    }

    const date = new Date();
    const review = {
      isbn,
      username,
      stars,
      text,
      date: `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`,
    };
    this.reviews.push(review);

    try {
      await fs.writeFile(this.file, JSON.stringify(data, null, 2));
    } catch (error) {
      // FIXME: is 500 Internal Sever Error the correct code? 'the server encountered an unexpected
      //  condition that prevented it from fulfilling the request'
      return { statusCode: 500, message: { error: 'Unable to add review.' } };
    }

    return { statusCode: 201, message: { message: 'Added review.' } };
  }

  // update review
  async updateReview(isbn: string, username: string, stars: 0 | 1 | 2 | 3 | 4 | 5, text: string) {
    const foundReview = await this.#findReview(isbn, username);

    if (!foundReview) {
      // FIXME: use 204 No Content with empty data instead of 404?
      // see discussion here: https://stackoverflow.com/questions/11746894/what-is-the-proper-rest-response-code-for-a-valid-request-but-an-empty-data
      return { statusCode: 404, message: { error: "Review doesn't exist." } };
    }

    const date = new Date();
    foundReview.date = `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;
    foundReview.stars = stars;
    foundReview.text = text;

    try {
      await fs.writeFile(this.file, JSON.stringify(data, null, 2));
    } catch (error) {
      // FIXME: is 500 Internal Sever Error the correct code? 'the server encountered an unexpected
      //  condition that prevented it from fulfilling the request'
      return { statusCode: 500, message: { error: 'Unable to update review.' } };
    }

    return { statusCode: 201, message: { message: 'Updated review' } };
  }

  // delete review
  async deleteReview(isbn: string, username: string) {
    const foundIndex = this.reviews.findIndex((review: Review) => review.isbn === isbn
      && review.username === username);

    if (!foundIndex) {
      return { statusCode: 404, message: { error: "Review doesn't exist." } };
    }

    this.reviews.splice(foundIndex, 1);

    try {
      await fs.writeFile(this.file, JSON.stringify(data, null, 2));
    } catch (error) {
      // FIXME: is 500 Internal Sever Error the correct code? 'the server encountered an unexpected
      //  condition that prevented it from fulfilling the request'
      return { statusCode: 500, message: { error: 'Unable to delete review.' } };
    }

    return { statusCode: 200, message: { message: 'Deleted review' } };
  }

  // helper method to get a review
  async #findReview(isbn: string, username: string) {
    const foundReviews = this.reviews.filter((review: Review) => review.isbn === isbn
      && review.username === username);

    if (foundReviews.length === 0) {
      return null;
    }

    return foundReviews[0];
  }
}
