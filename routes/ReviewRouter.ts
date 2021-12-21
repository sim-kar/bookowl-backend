import express from 'express';
import ReviewService from '../services/ReviewService';

const ReviewRouter = express.Router();

// get all reviews --need at least one 'get all' for project
ReviewRouter.get('/', async (req, res) => {
  const payload = await ReviewService.getReviews();
  res.status(payload.statusCode).json(payload.reviews);
});

// get a review by isbn and username
ReviewRouter.get('/:username/book/:isbn', async (req, res) => {
  const payload = await ReviewService.getReview(req.params.isbn, req.params.username);
  res.status(payload.statusCode).json(payload.review);
});

// post review
ReviewRouter.post('/', async (req, res) => {
  const payload = await ReviewService.addReview(
    req.body.isbn,
    req.body.username,
    req.body.stars,
    req.body.text,
  );
  res.status(payload.statusCode).json(payload.message);
});

// put review
ReviewRouter.put('/', async (req, res) => {
  const payload = await ReviewService.updateReview(
    req.body.isbn,
    req.body.username,
    req.body.stars,
    req.body.text,
  );
  res.status(payload.statusCode).json(payload.message);
});

// delete review
ReviewRouter.delete('/:username/book/:isbn', async (req, res) => {
  const payload = await ReviewService.deleteReview(req.params.isbn, req.params.username);
  res.status(payload.statusCode).json(payload.message);
});

export default ReviewRouter;
