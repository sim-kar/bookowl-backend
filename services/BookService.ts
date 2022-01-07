import https from 'https';
import IBook from './IBook';
import Book from '../models/Book';
import Review from '../models/Review';
import CONSTANTS from '../utils/CONSTANTS';
import Status from '../models/Status';
import DateUtils from '../utils/DateUtils';

/** Provides access to books in database, or books from the Google Books API. */
export default class BookService {
  /**
   * Searches Google Books for books with the provided title.
   *
   * @param title the title to search for.
   * @param limit the maximum amount of results to get.
   * @returns the HTTP status code and found books.
   */
  static async searchBooksByTitle(title: string, limit: number = CONSTANTS.limit) {
    return BookService.searchBook(title, CONSTANTS.titleField, limit);
  }

  /**
   * Searches Google Books for books by the provided author.
   *
   * @param author the author to search for.
   * @param limit the maximum amount of results to get.
   * @returns the HTTP status code and found books.
   */
  static async searchBooksByAuthor(author: string, limit: number = CONSTANTS.limit) {
    return BookService.searchBook(author, CONSTANTS.authorField, limit);
  }

  /**
   * Helper method to search for books using Google Books API.
   *
   * @param keyword the keyword to search for.
   * @param field the field to search in.
   * @param limit the maximum amount of results to get.
   * @returns the HTTP status code and found books.
   * @private
   */
  private static searchBook(keyword: string, field: string, limit: number) {
    const options = {
      hostname: 'www.googleapis.com',
      path: `/books/v1/volumes?q=${field}:${encodeURI(keyword)}&maxResults=`
        // google books limits how many results you can get
        + `${limit > CONSTANTS.maxAllowedResults ? CONSTANTS.maxAllowedResults : limit}`
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
            if (this.validateBookData(book.volumeInfo)) {
              books.push(<IBook>{
                isbn: BookService.getIdentifier(book.volumeInfo.industryIdentifiers),
                title: book.volumeInfo.title,
                authors: book.volumeInfo.authors,
                cover: BookService.getCover(book.volumeInfo.imageLinks),
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

  /**
   * Helper method to validate book data from Google Books API; the data object must contain all
   * required keys to be valid.
   *
   * @param data the data returned by the API.
   * @returns whether data was valid or not.
   * @private
   */
  private static validateBookData(data: any): boolean {
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

  /**
   * Get the industry identifier of a book from Google Books API. The preferred identifier is
   * ISBN13, followed by ISBN10; if both are unavailable whatever identifier is present will be
   * returned.
   *
   * @param identifiers the industry identifier codes of a book from Google Books.
   * @returns the identifier in the most preferred available format.
   * @private
   */
  private static getIdentifier(identifiers: [{ type: string, identifier: string }]) {
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

  /**
   * Get the URL for a book's cover. If no cover is available the URL of a placeholder image
   * will be returned instead.
   *
   * @param images the image links of a book from Google Books.
   * @returns the link to an image of the book's cover.
   * @private
   */
  private static getCover(images: any) {
    if (!images) {
      return CONSTANTS.placeholderImage;
    }

    // remove page curl graphic from images from google books API and
    // replace http with https to avoid mixed content warnings
    return images.thumbnail.replace('&edge=curl', '').replace('http', 'https');
  }

  /**
   * Get a book by its ISBN.
   *
   * @param isbn the book's ISBN.
   * @ returns the HTTP status code and book.
   */
  static async getBook(isbn: string) {
    const foundBook = await Book.findOne({ isbn }, ['-_id', '-__v']);

    if (!foundBook) {
      return { statusCode: 204, book: {} };
    }

    return { statusCode: 200, book: foundBook };
  }

  /**
   * Get the highest rated books, sorted in descending order.
   *
   * @param limit the maximum amount of results to get.
   * @ returns the HTTP status code and books.
   */
  static async getHighestRatedBooks(limit: number = CONSTANTS.limit) {
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

  /**
   * Get the most recently updated (i.e. user status added or changed) books, in descending order.
   * Only returns unique books.
   *
   * @param status only get books with this user status (optional).
   * @param limit the maximum amount of results to get.
   * @returns the HTTP status code and books.
   */
  static async getRecentlyUpdatedBooks(status?: number, limit: number = CONSTANTS.limit) {
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

  /**
   * Get the most popular books, in descending order. Popularity is decided by how often a book has
   * been updated (i.e. user status added or changed) within a recent timespan.
   *
   * @param status only get books with this user status (optional).
   * @param limit the maximum amount of results to get.
   * @returns the HTTP status code and books.
   */
  static async getPopularBooks(status?: number, limit: number = CONSTANTS.limit) {
    if (limit < 1) {
      return { statusCode: 204, books: {} };
    }

    let statusFilter = {};

    if (status) {
      statusFilter = { status };
    }

    // status updates before this date doesn't affect popular ranking
    const minDate = DateUtils.getRelativeDate(CONSTANTS.popularDateCutoff);

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

  /**
   * Add a book.
   *
   * @param reqBook the book to add.
   * @returns the HTTP status code and result message.
   */
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
