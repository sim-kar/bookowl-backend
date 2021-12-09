import express from 'express';
import cors from 'cors';
import BookRouter from './routes/BookRouter';
import ReviewRouter from './routes/ReviewRouter';
import StatusRouter from './routes/StatusRouter';
import UserRouter from './routes/UserRouter';
import dbConnect from './dbConnect';

const app = express();

// DATABASE
await dbConnect();

// MIDDLEWARE
app.use(express.json());
app.use(cors());

// ROUTES
app.use('/api/books', BookRouter);
app.use('/api/reviews', ReviewRouter);
app.use('/api/statuses', StatusRouter);
app.use('/api/users', UserRouter);

export default app;
