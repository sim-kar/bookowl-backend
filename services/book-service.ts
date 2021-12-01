import IBook from './IBook';
import Book from '../models/book-model';

export default class BookService {
  // get book by isbn
  static async getBookById(isbn: string) {
    // const foundBook = this.books.find((book: BookI) => book.isbn === isbn);

    const foundBook = await Book.findOne({ isbn });

    if (!foundBook) {
      // FIXME: use 204 No Content with empty data instead of 404?
      // see discussion here: https://stackoverflow.com/questions/11746894/what-is-the-proper-rest-response-code-for-a-valid-request-but-an-empty-data
      return { statusCode: 204, book: {} };
    }

    return { statusCode: 200, book: foundBook };
  }

  // add book
  static async addBook(reqBook: IBook) {
    if (await Book.exists({ isbn: reqBook.isbn })) {
      return { statusCode: 409, message: { error: 'Book already exists.' } };
    }

    const newBook = new Book({
      ...reqBook,
    });

    try {
      await newBook.save();
    } catch (error) {
      return { statusCode: 500, message: { error: 'Unable to add book.' } };
    }

    return { statusCode: 201, message: { message: 'Added book.' } };
  }
}
