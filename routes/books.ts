import express from 'express';
import BookService from '../services/book-service';

const router = express.Router();
const bookService = new BookService();

// get a book
router.get('/:isbn', async (req, res) => {
  const payload = await bookService.getBookById(req.params.isbn);
  res.status(payload.statusCode).json(payload.book);
});

// get all user's books?

// get all user's books by status?

// post a book
router.post('/', async (req, res) => {
  const payload = await bookService.addBook(req.body);
  res.status(payload.statusCode).json(payload.message);
});

export default router;
