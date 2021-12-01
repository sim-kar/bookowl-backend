import express from 'express';
import cors from 'cors';
import books from './routes/book-router';
import reviews from './routes/review-router';
import connect from './db';

const app = express();

// DATABASE
await connect();

// MIDDLEWARE
app.use(express.json());
app.use(cors());

// ROUTES
app.use('/api/books', books);
app.use('/api/reviews', reviews);

export default app;
