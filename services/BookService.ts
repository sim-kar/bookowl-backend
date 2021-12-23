import https from 'https';
import IBook from './IBook';
import Book from '../models/Book';
import Review from '../models/Review';
import Constants from '../utils/Constants';
import Status from '../models/Status';
import DateUtils from '../utils/DateUtils';

export default class BookService {
  static async searchBooksByTitle(title: string, limit: number = Constants.LIMIT) {
    return BookService.#searchBook(title, Constants.TITLE_FIELD, limit);
  }

  static async searchBooksByAuthor(author: string, limit: number = Constants.LIMIT) {
    return BookService.#searchBook(author, Constants.AUTHOR_FIELD, limit);
  }

  // helper method to search for books using an open api (google books)
  static #searchBook(keyword: string, field: string, limit: number) {
    const options = {
      hostname: 'www.googleapis.com',
      path: `/books/v1/volumes?q=${field}:${encodeURI(keyword)}&maxResults=`
        // google books limits how many results you can get
        + `${limit > Constants.MAX_ALLOWED_RESULTS ? Constants.MAX_ALLOWED_RESULTS : limit}`
        + '&orderBy=relevance&projection=FULL',
    };

    return new Promise<{ statusCode: number | undefined, books: IBook[] }>((resolve, reject) => {
      https.get(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          const result = JSON.parse(data);

          if (!result.items || result.totalItems === 0) {
            return resolve({ statusCode: 204, books: [] });
          }

          const foundBooks = result.items;
          const books: IBook[] = [];

          foundBooks.forEach((book: any) => {
            // validate the data. Some results from google books lack the necessary keys
            if (this.#validateBookData(book.volumeInfo)) {
              books.push(<IBook>{
                isbn: BookService.#getIdentifier(book.volumeInfo.industryIdentifiers),
                title: book.volumeInfo.title,
                authors: book.volumeInfo.authors,
                cover: BookService.#getCover(book.volumeInfo.imageLinks),
                pages: book.volumeInfo.pageCount,
                published: book.volumeInfo.publishedDate,
                publisher: book.volumeInfo.publisher,
                language: book.volumeInfo.language,
                description: book.volumeInfo.description,
                categories: book.volumeInfo.categories,
              });
            }
          });

          return resolve({ statusCode: res.statusCode, books });
        });

        res.on('error', (e) => reject(e));
      });
    });
  }

  static #validateBookData(data: any): boolean {
    // imageLinks are allowed to be absent
    const requiredKeys = [
      'industryIdentifiers',
      'title',
      'authors',
      'pageCount',
      'publishedDate',
      'publisher',
      'language',
      'description',
      'categories',
    ];
    let valid = true;

    requiredKeys.forEach((key) => {
      if (!(key in data)) {
        valid = false;
      }
    });

    return valid;
  }

  static #getIdentifier(identifiers: [{ type: string, identifier: string }]) {
    // prefer isbn13 > isbn10 > other
    let foundIdentifier = identifiers.find((id) => id.type === 'ISBN_13');

    if (!foundIdentifier) {
      foundIdentifier = identifiers.find((id) => id.type === 'ISBN_10');
    }

    if (!foundIdentifier) {
      [foundIdentifier] = identifiers;
    }

    return foundIdentifier.identifier;
  }

  static #getCover(images: any) {
    if (!images) {
      return Constants.PLACEHOLDER_IMAGE;
    }

    // remove page curl graphic from images from google books API
    return images.thumbnail.replace('&edge=curl', '');
  }

  // get book by isbn
  static async getBook(isbn: string) {
    const foundBook = await Book.findOne({ isbn }, ['-_id', '-__v']);

    if (!foundBook) {
      return { statusCode: 204, book: {} };
    }

    return { statusCode: 200, book: foundBook };
  }

  // get the highest rated books
  static async getHighestRatedBooks(limit: number = Constants.LIMIT) {
    if (limit < 1) {
      return { statusCode: 204, books: {} };
    }

    // group reviews by book and get the average rating
    const foundBooks = await Review.aggregate([
      { $group: { _id: '$book', book: { $first: '$book' }, averageRating: { $avg: '$stars' } } },
      { $sort: { averageRating: -1 } },
      { $limit: limit },
    ]);

    if (foundBooks.length === 0) {
      return { statusCode: 204, books: {} };
    }

    await Review.populate(foundBooks, 'book');

    return { statusCode: 200, books: foundBooks };
  }

  // get most recently updated (user status) books (only returns unique books)
  static async getRecentlyUpdatedBooks(status?: number, limit: number = Constants.LIMIT) {
    if (limit < 1) {
      return { statusCode: 204, books: {} };
    }

    let statusFilter = {};

    if (status) {
      statusFilter = { status };
    }

    const foundBooks = await Status.aggregate([
      { $match: statusFilter },
      { $group: { _id: '$book', book: { $first: '$book' }, date: { $max: '$date' } } },
      { $sort: { date: -1 } },
      { $limit: limit },
    ]);

    if (foundBooks.length === 0) {
      return { statusCode: 204, books: {} };
    }

    await Status.populate(foundBooks, 'book');

    return { statusCode: 200, books: foundBooks };
  }

  static async getPopularBooks(status?: number, limit: number = Constants.LIMIT) {
    if (limit < 1) {
      return { statusCode: 204, books: {} };
    }

    let statusFilter = {};

    if (status) {
      statusFilter = { status };
    }

    // status updates before this date doesn't affect popular ranking
    const minDate = DateUtils.getRelativeDate(Constants.POPULAR_DATE_CUTOFF);

    const foundBooks = await Status.aggregate([
      { $match: statusFilter },
      { $match: { date: { $gte: minDate } } },
      { $group: { _id: '$book', book: { $first: '$book' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);

    if (foundBooks.length === 0) {
      return { statusCode: 204, books: {} };
    }

    await Status.populate(foundBooks, 'book');

    return { statusCode: 200, books: foundBooks };
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
