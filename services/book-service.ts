import https from 'https';
import IBook from './IBook';
import Book from '../models/book-model';

export default class BookService {
  static async searchBooksByTitle(title: string) {
    return BookService.#searchBook(title, 'intitle', 10);
  }

  static async searchBooksByAuthor(author: string) {
    return BookService.#searchBook(author, 'inauthor', 10);
  }

  // helper method to search for books using an open api (google books)
  static #searchBook(keyword: string, field: string, maxResults: number) {
    const options = {
      hostname: 'www.googleapis.com',
      path: `/books/v1/volumes?q=${field}:${encodeURI(keyword)}&maxResults=${maxResults}`
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

          if (result.totalItems === 0) {
            return resolve({ statusCode: 204, books: [] });
          }

          const foundBooks = result.items;
          const books: IBook[] = [];

          foundBooks.forEach((book: any) => {
            books.push(<IBook>{
              isbn: BookService.#getIdentifier(book.volumeInfo.industryIdentifiers),
              title: book.volumeInfo.title,
              authors: book.volumeInfo.authors,
              cover: BookService.#getCover(book.volumeInfo.imageLinks),
              pages: book.volumeInfo.pageCount,
              published: book.volumeInfo.publisher,
              publisher: book.volumeInfo.publishedDate,
              language: book.volumeInfo.language,
              description: book.volumeInfo.description,
              categories: book.volumeInfo.categories,
            });
          });

          return resolve({ statusCode: res.statusCode, books });
        });

        res.on('error', (e) => {
          console.error(e);
          return reject(e);
        });
      });
    });
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
      return ''; // TODO: path to placeholder
    }

    return images.thumbnail;
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
