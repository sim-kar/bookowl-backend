import Status from '../models/status-model';
import Book from '../models/book-model';
import User from '../models/user-model';

export default class StatusService {
  // get a users book statuses from db
  static async getStatuses(username: string, status: string) {
    const foundStatuses = await Status.find({ username, status }, ['-_id', '-__v'])
      .populate({
        path: 'book',
        // not possible to remove _id, but can remove __v by specifying optional fields
        select: ['title', 'author', 'cover', 'pages', 'published', 'publisher', 'language'],
      });

    if (foundStatuses.length === 0) {
      // FIXME: use 204 No Content with empty data instead of 404?
      // see discussion here: https://stackoverflow.com/questions/11746894/what-is-the-proper-rest-response-code-for-a-valid-request-but-an-empty-data
      return { statusCode: 204, statuses: {} };
    }

    return { statusCode: 200, statuses: foundStatuses };
  }

  // get a book status by isbn and username
  static async getStatus(isbn: string, username: string) {
    const foundStatus = await Status.findOne({ isbn, username }, ['-_id', '-__v'])
      .populate({
        path: 'book',
        // not possible to remove _id, but can remove __v by specifying optional fields
        select: ['title', 'author', 'cover', 'pages', 'published', 'publisher', 'language'],
      });

    if (!foundStatus) {
      // FIXME: use 204 No Content with empty data instead of 404?
      // see discussion here: https://stackoverflow.com/questions/11746894/what-is-the-proper-rest-response-code-for-a-valid-request-but-an-empty-data
      return { statusCode: 204, status: {} };
    }

    return { statusCode: 200, status: foundStatus };
  }

  // add a book status to the databas
  static async addStatus(isbn: string, username: string, status: string) {
    if (await Status.exists({ isbn, username })) {
      return { statusCode: 409, message: { error: 'Status already exists.' } };
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
  static async updateStatus(isbn: string, username: string, status: string) {
    const foundStatus = await Status.findOne({ isbn, username });

    if (!foundStatus) {
      // FIXME: use 204 No Content with empty data instead of 404?
      // see discussion here: https://stackoverflow.com/questions/11746894/what-is-the-proper-rest-response-code-for-a-valid-request-but-an-empty-data
      return { statusCode: 404, message: { error: "Status doesn't exist." } };
    }

    foundStatus.status = status;

    try {
      await foundStatus.save();
    } catch (error) {
      // FIXME: is 500 Internal Sever Error the correct code? 'the server encountered an unexpected
      //  condition that prevented it from fulfilling the request'
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
      // FIXME: is 500 Internal Sever Error the correct code? 'the server encountered an unexpected
      //  condition that prevented it from fulfilling the request'
      return { statusCode: 500, message: { error: 'Unable to delete status.' } };
    }

    return { statusCode: 200, message: { message: 'Deleted status' } };
  }
}
