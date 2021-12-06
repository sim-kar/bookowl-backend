import express from 'express';
import cors from 'cors';
import books from './routes/book-router';
import reviews from './routes/review-router';
import statuses from './routes/status-router';
import users from './routes/user-router';
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
app.use('/api/statuses', statuses);
app.use('/api/users', users);

export default app;
