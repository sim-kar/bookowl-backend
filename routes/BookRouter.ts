import express from 'express';
import BookService from '../services/BookService';

const BookRouter = express.Router();
// search for books by title
BookRouter.get('/title=:title', async (req, res) => {
  const payload = await BookService.searchBooksByTitle(req.params.title);
  if (payload.statusCode != null) {
    res.status(payload.statusCode).json(payload.books);
  }
});

// search for books by author
BookRouter.get('/author=:author', async (req, res) => {
  const payload = await BookService.searchBooksByAuthor(req.params.author);
  if (payload.statusCode != null) {
    res.status(payload.statusCode).json(payload.books);
  }
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
