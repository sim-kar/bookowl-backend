import express from 'express';
import BookService from '../services/book-service';

const router = express.Router();

// get a book
router.get('/:isbn', async (req, res) => {
  const payload = await BookService.getBookById(req.params.isbn);
  res.status(payload.statusCode).json(payload.book);
});

// post a book
router.post('/', async (req, res) => {
  const payload = await BookService.addBook(req.body);
  res.status(payload.statusCode).json(payload.message);
});

export default router;
