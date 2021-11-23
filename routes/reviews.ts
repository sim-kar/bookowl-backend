import express from 'express';
import ReviewService from '../services/review-service';

const router = express.Router();
const reviewService = new ReviewService();

// get all reviews --need at least one 'get all' for project
router.get('/', async (req, res) => {
  const payload = await reviewService.getReviews();
  res.status(payload.statusCode).json(payload.reviews);
});

// get a review by isbn and username
router.get('/:isbn', async (req, res) => {
  const payload = await reviewService.getReview(req.params.isbn, req.body.username);
  res.status(payload.statusCode).json(payload.review);
});

// post review
router.post('/', async (req, res) => {
  const payload = await reviewService.addReview(
    req.body.isbn,
    req.body.username,
    req.body.stars,
    req.body.text,
  );
  res.status(payload.statusCode).json(payload.message);
});

// put review
router.put('/', async (req, res) => {
  const payload = await reviewService.updateReview(
    req.body.isbn,
    req.body.username,
    req.body.stars,
    req.body.text,
  );
  res.status(payload.statusCode).json(payload.message);
});

// delete review
router.delete('/:isbn', async (req, res) => {
  const payload = await reviewService.deleteReview(req.params.isbn, req.body.username);
  res.status(payload.statusCode).json(payload.message);
});

export default router;
