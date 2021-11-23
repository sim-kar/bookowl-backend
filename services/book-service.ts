import fs from 'fs/promises';
import data from '../test-db.json';
import Book from './Book';

export default class BookService {
  private file: string;
  private books: Array<Book>;

  constructor() {
    this.file = './test-db.json';
    this.books = data.books;
  }

  // get book by isbn
  async getBookById(isbn: string) {
    const foundBook = this.books.find((book: Book) => book.isbn === isbn);

    if (!foundBook) {
      // FIXME: use 204 No Content with empty data instead of 404?
      // see discussion here: https://stackoverflow.com/questions/11746894/what-is-the-proper-rest-response-code-for-a-valid-request-but-an-empty-data
      return { statusCode: 204, book: {} };
    }

    return { statusCode: 200, book: foundBook };
  }

  // add book
  async addBook(reqBook: Book) {
    if (this.books.some((book) => book.isbn === reqBook.isbn)) {
      return { statusCode: 409, message: { error: 'Book already exists.' } };
    }

    this.books.push(reqBook);

    try {
      await fs.writeFile(this.file, JSON.stringify(data, null, 2));
    } catch (error) {
      // FIXME: is 500 Internal Sever Error the correct code? 'the server encountered an unexpected
      //  condition that prevented it from fulfilling the request'
      return { statusCode: 500, message: { error: 'Unable to add book.' } };
    }

    return { statusCode: 201, message: { message: 'Added book.' } };
  }
}
