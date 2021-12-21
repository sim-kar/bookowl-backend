import express from 'express';
import BookService from '../services/BookService';
import NumberUtils from '../utils/NumberUtils';

const BookRouter = express.Router();
// search for books by title
BookRouter.get('/title=:title', async (req, res) => {
  // convert optional parameter to number if it exists
  const maxResults = NumberUtils.getNumber(req.query.maxResults);

  const payload = await BookService.searchBooksByTitle(req.params.title, maxResults);
  if (payload.statusCode != null) {
    res.status(payload.statusCode).json(payload.books);
  }
});

// search for books by author
BookRouter.get('/author=:author', async (req, res) => {
  // convert optional parameter to number if it exists
  const maxResults = NumberUtils.getNumber(req.query.maxResults);

  const payload = await BookService.searchBooksByAuthor(req.params.author, maxResults);
  if (payload.statusCode != null) {
    res.status(payload.statusCode).json(payload.books);
  }
});

// get the highest rated books
BookRouter.get('/highest-rated', async (req, res) => {
  const payload = await BookService.getHighestRatedBooks(req.body.maxResults);
  res.status(payload.statusCode).json(payload.books);
});

// get the most recently updated books
BookRouter.get('/recently-updated', async (req, res) => {
  const payload = await BookService.getRecentlyAddedBooks(
    req.body.maxResults,
    req.body.statusFilter,
  );
  res.status(payload.statusCode).json(payload.books);
});

// get a book
BookRouter.get('/:isbn', async (req, res) => {
  const payload = await BookService.getBook(req.params.isbn);
  res.status(payload.statusCode).json(payload.book);
});

// post a book
BookRouter.post('/', async (req, res) => {
  const payload = await BookService.addBook(req.body);
  res.status(payload.statusCode).json(payload.message);
});

export default BookRouter;
