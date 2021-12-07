import express from 'express';
import BookService from '../services/book-service';

const router = express.Router();
// search for books by title
router.get('/title=:title', async (req, res) => {
  const payload = await BookService.searchBooksByTitle(req.params.title);
  if (payload.statusCode != null) {
    res.status(payload.statusCode).json(payload.books);
  }
});

// search for books by author
router.get('/author=:author', async (req, res) => {
  const payload = await BookService.searchBooksByAuthor(req.params.author);
  if (payload.statusCode != null) {
    res.status(payload.statusCode).json(payload.books);
  }
});

// get a book
router.get('/:isbn', async (req, res) => {
  const payload = await BookService.getBook(req.params.isbn);
  res.status(payload.statusCode).json(payload.book);
});

// post a book
router.post('/', async (req, res) => {
  const payload = await BookService.addBook(req.body);
  res.status(payload.statusCode).json(payload.message);
});

export default router;
