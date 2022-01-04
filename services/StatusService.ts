import Status from '../models/Status';
import Book from '../models/Book';
import User from '../models/User';
import IBook from './IBook';
import BookService from './BookService';

/** Provides access to statuses in the database. */
export default class StatusService {
  /**
   * Get all statuses for a user.
   *
   * @param username the user's username.
   * @param status the status to get (0-2).
   * @returns the HTTP status code and statuses.
   */
  static async getStatuses(username: string, status: number) {
    const foundStatuses = await Status.find({ username, status }, ['-_id', '-__v'])
      .populate({ path: 'book' });

    if (foundStatuses.length === 0) {
      return { statusCode: 204, statuses: {} };
    }

    return { statusCode: 200, statuses: foundStatuses };
  }

  /**
   * Get a status.
   *
   * @param isbn the book's ISBN.
   * @param username the user's username.
   */
  static async getStatus(isbn: string, username: string) {
    const foundStatus = await Status.findOne({ isbn, username }, ['-_id', '-__v'])
      .populate({ path: 'book' });

    if (!foundStatus) {
      return { statusCode: 204, status: {} };
    }

    return { statusCode: 200, status: foundStatus };
  }

  /**
   * Add a status. If the book the status is being added for isn't already in the database,
   * the book can be provided as parameter, and it will be added along with the status.
   *
   * @param isbn the book's ISBN.
   * @param username the user's username.
   * @param status the status (0-2).
   * @param book the book to add to database (optional).
   * @returns the HTTP status code and result message.
   */
  static async addStatus(isbn: string, username: string, status: number, book?: IBook) {
    if (await Status.exists({ isbn, username })) {
      return { statusCode: 409, message: { error: 'Status already exists.' } };
    }

    // a book was given as parameter, try to add it to the db
    if (book) {
      await BookService.addBook(book);
    }

    // make sure isbn and username actually exist in db
    // the book _id is needed for population, so need to get book from db even if it was supplied
    const foundBook = await Book.findOne({ isbn }, ['_id']);

    if (!foundBook || !await User.exists({ username })) {
      return { statusCode: 404, message: { error: "Book or user doesn't exist." } };
    }

    const newStatus = new Status({
      isbn,
      username,
      status,
      date: new Date(),
      book: foundBook._id,
    });

    try {
      await newStatus.save();
    } catch (error) {
      return { statusCode: 500, message: { error: 'Unable to add status.' } };
    }

    return { statusCode: 201, message: { message: 'Added status.' } };
  }

  /**
   * Update a status.
   *
   * @param isbn the book's ISBN.
   * @param username the user's username.
   * @param status the status (0-2).
   * @returns the HTTP status code and result message.
   */
  static async updateStatus(isbn: string, username: string, status: number) {
    const foundStatus = await Status.findOne({ isbn, username });

    if (!foundStatus) {
      return { statusCode: 404, message: { error: "Status doesn't exist." } };
    }

    foundStatus.status = status;
    foundStatus.date = new Date();

    try {
      await foundStatus.save();
    } catch (error) {
      return { statusCode: 500, message: { error: 'Unable to update status.' } };
    }

    return { statusCode: 200, message: { message: 'Updated status' } };
  }

  /**
   * Delete a status.
   *
   * @param isbn the book's isbn.
   * @param username the user's username.
   * @returns the HTTP status code and result message.
   */
  static async deleteStatus(isbn: string, username: string) {
    try {
      const deletedStatus = await Status.findOneAndDelete({ isbn, username });

      if (!deletedStatus) {
        return { statusCode: 404, message: { error: "Status doesn't exist." } };
      }
    } catch (error) {
      return { statusCode: 500, message: { error: 'Unable to delete status.' } };
    }

    return { statusCode: 200, message: { message: 'Deleted status' } };
  }
}
