import express from 'express';
import books from './routes/books';
import reviews from './routes/reviews';

const app = express();

// middleware
app.use(express.json());

// routes
app.use('/api/books', books);
app.use('/api/reviews', reviews);

export default app;
