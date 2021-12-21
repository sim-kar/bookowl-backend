import https from 'https';
import IBook from './IBook';
import Book from '../models/Book';
import Review from '../models/Review';
import Constants from '../utils/Constants';
import Status from '../models/Status';

export default class BookService {
  static async searchBooksByTitle(title: string, maxResults: number = Constants.MAX_RESULTS) {
    return BookService.#searchBook(title, Constants.TITLE_FIELD, maxResults);
  }

  static async searchBooksByAuthor(author: string, maxResults: number = Constants.MAX_RESULTS) {
    return BookService.#searchBook(author, Constants.AUTHOR_FIELD, maxResults);
  }

  // helper method to search for books using an open api (google books)
  static #searchBook(keyword: string, field: string, maxResults: number) {
    const options = {
      hostname: 'www.googleapis.com',
      path: `/books/v1/volumes?q=${field}:${encodeURI(keyword)}&maxResults=`
        + `${maxResults > 40 ? 40 : maxResults}` // google books allows at most 40 results
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
      // FIXME: use 204 No Content with empty data instead of 404?
      // see discussion here:
      // https://stackoverflow.com/questions/11746894/what-is-the-proper-rest-response-code-for-a-valid-request-but-an-empty-data
      return { statusCode: 204, book: {} };
    }

    return { statusCode: 200, book: foundBook };
  }

  // get the highest rated books
  static async getHighestRatedBooks(maxResults: number) {
    if (maxResults < 1) {
      return { statusCode: 204, books: {} };
    }

    // group reviews by book and get the average rating
    const foundBooks = await Review.aggregate([
      { $group: { _id: '$book', book: { $first: '$book' }, averageRating: { $avg: '$stars' } } },
      { $sort: { averageRating: -1 } },
      { $limit: maxResults },
    ]);

    if (foundBooks.length === 0) {
      // FIXME: use 204 No Content with empty data instead of 404?
      // see discussion here: https://stackoverflow.com/questions/11746894/what-is-the-proper-rest-response-code-for-a-valid-request-but-an-empty-data
      return { statusCode: 204, books: {} };
    }

    await Review.populate(foundBooks, 'book');

    return { statusCode: 200, books: foundBooks };
  }

  // get most recently added (to a user's bookshelf) books (only returns unique books)
  static async getRecentlyAddedBooks(maxResults: number, statusFilter: {} | { status: number }) {
    const foundBooks = await Status.aggregate([
      { $match: statusFilter },
      { $sort: { date: -1 } },
      { $group: { _id: '$book', book: { $first: '$book' }, date: { $first: '$date' } } },
      { $limit: maxResults },
    ]);

    if (foundBooks.length === 0) {
      // FIXME: use 204 No Content with empty data instead of 404?
      // see discussion here: https://stackoverflow.com/questions/11746894/what-is-the-proper-rest-response-code-for-a-valid-request-but-an-empty-data
      return { statusCode: 204, books: {} };
    }

    await Status.populate(foundBooks, 'book');

    return { statusCode: 200, books: foundBooks };
  }

  // TODO: get popular books

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
