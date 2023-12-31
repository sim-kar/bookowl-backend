import express, { Request, Response } from 'express';
import BookService from '../services/BookService';
import NumberUtils from '../utils/NumberUtils';

const BookRouter = express.Router();

/** Search for books by title */
BookRouter.get('/title/:title', async (req: Request, res: Response) => {
  // convert optional parameter to number if it exists
  const limit = NumberUtils.getNumberOrUndefined(req.query.limit);

  const payload = await BookService.searchBooksByTitle(req.params.title, limit);
  if (payload.statusCode != null) {
    res.status(payload.statusCode).json(payload.books);
  }
});

/** Search for books by author */
BookRouter.get('/author/:author', async (req: Request, res: Response) => {
  // convert optional parameter to number if it exists
  const limit = NumberUtils.getNumberOrUndefined(req.query.limit);

  const payload = await BookService.searchBooksByAuthor(req.params.author, limit);
  if (payload.statusCode != null) {
    res.status(payload.statusCode).json(payload.books);
  }
});

/** Get the highest rated books */
BookRouter.get('/highest-rated', async (req: Request, res: Response) => {
  const limit = NumberUtils.getNumberOrUndefined(req.query.limit);

  const payload = await BookService.getHighestRatedBooks(limit);
  res.status(payload.statusCode).json(payload.books);
});

/** Get the most recently updated books */
BookRouter.get('/recently-updated', async (req: Request, res: Response) => {
  const limit = NumberUtils.getNumberOrUndefined(req.query.limit);
  const statusFilter = NumberUtils.getNumberOrUndefined(req.query.statusFilter);

  const payload = await BookService.getRecentlyUpdatedBooks(statusFilter, limit);
  res.status(payload.statusCode).json(payload.books);
});

/** Get the most popular books */
BookRouter.get('/popular', async (req: Request, res: Response) => {
  const limit = NumberUtils.getNumberOrUndefined(req.query.limit);
  const statusFilter = NumberUtils.getNumberOrUndefined(req.query.statusFilter);

  const payload = await BookService.getPopularBooks(statusFilter, limit);
  res.status(payload.statusCode).json(payload.books);
});

/** Get a book by ISBN */
BookRouter.get('/:isbn', async (req: Request, res: Response) => {
  const payload = await BookService.getBook(req.params.isbn);
  res.status(payload.statusCode).json(payload.book);
});

// not currently active
/** Post a book */
// BookRouter.post('/', async (req: Request, res: Response) => {
//   const payload = await BookService.addBook(req.body);
//   res.status(payload.statusCode).json(payload.message);
// });

export default BookRouter;
