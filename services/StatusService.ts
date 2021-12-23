import Status from '../models/Status';
import Book from '../models/Book';
import User from '../models/User';
import IBook from './IBook';
import BookService from './BookService';

export default class StatusService {
  // get a users book statuses from db
  static async getStatuses(username: string, status: number) {
    const foundStatuses = await Status.find({ username, status }, ['-_id', '-__v'])
      .populate({ path: 'book' });

    if (foundStatuses.length === 0) {
      return { statusCode: 204, statuses: {} };
    }

    return { statusCode: 200, statuses: foundStatuses };
  }

  // get a book status by isbn and username
  static async getStatus(isbn: string, username: string) {
    const foundStatus = await Status.findOne({ isbn, username }, ['-_id', '-__v'])
      .populate({ path: 'book' });

    if (!foundStatus) {
      return { statusCode: 204, status: {} };
    }

    return { statusCode: 200, status: foundStatus };
  }

  // add a book status to the database
  static async addStatus(isbn: string, username: string, status: number, book?: IBook) {
    if (await Status.exists({ isbn, username })) {
      return { statusCode: 409, message: { error: 'Status already exists.' } };
    }

    // a book was given as parameter, try to add it to the db
    if (book) {
      await BookService.addBook(book);
    }

    // make sure isbn and username actually exist in db
    // the book _id is needed for population
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

  // update a book status in the database
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

  // delete a book status in the database
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
