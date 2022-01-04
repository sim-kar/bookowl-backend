import express, { Request, Response } from 'express';
import ReviewService from '../services/ReviewService';
import verifyToken from '../middlewares/verifyToken';

const ReviewRouter = express.Router();

/** Get all reviews */
ReviewRouter.get('/', async (req: Request, res: Response) => {
  const payload = await ReviewService.getReviews();
  res.status(payload.statusCode).json(payload.reviews);
});

/** Get reviews by ISBN */
ReviewRouter.get('/:isbn', async (req: Request, res: Response) => {
  const payload = await ReviewService.getReviewsForBook(req.params.isbn);
  res.status(payload.statusCode).json(payload.reviews);
});

/** Get a review by ISBN and username */
ReviewRouter.get('/:username/book/:isbn', async (req: Request, res: Response) => {
  const payload = await ReviewService.getReview(req.params.isbn, req.params.username);
  res.status(payload.statusCode).json(payload.review);
});

// ROUTES THAT REQUIRE AUTHORIZATION

/** Post a review */
ReviewRouter.post('/', [
  verifyToken,
  async (req: Request, res: Response) => {
    const payload = await ReviewService.addReview(
      req.body.isbn,
      req.body.username,
      req.body.stars,
      req.body.text,
    );
    res.status(payload.statusCode).json(payload.message);
  },
]);

/** Update a review */
ReviewRouter.put('/', [
  verifyToken,
  async (req: Request, res: Response) => {
    const payload = await ReviewService.updateReview(
      req.body.isbn,
      req.body.username,
      req.body.stars,
      req.body.text,
    );
    res.status(payload.statusCode).json(payload.message);
  },
]);

/** Delete a review */
ReviewRouter.delete('/:username/book/:isbn', [
  verifyToken,
  async (req: Request, res: Response) => {
    const payload = await ReviewService.deleteReview(req.params.isbn, req.params.username);
    res.status(payload.statusCode).json(payload.message);
  },
]);

export default ReviewRouter;
