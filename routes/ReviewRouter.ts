import express, { Request, Response } from 'express';
import ReviewService from '../services/ReviewService';
import verifyToken from '../middlewares/verifyToken';

const ReviewRouter = express.Router();

// get all reviews --need at least one 'get all' for project
ReviewRouter.get('/', async (req: Request, res: Response) => {
  const payload = await ReviewService.getReviews();
  res.status(payload.statusCode).json(payload.reviews);
});

// get reviews by isbn
ReviewRouter.get('/:isbn', async (req: Request, res: Response) => {
  const payload = await ReviewService.getReviewsForBook(req.params.isbn);
  res.status(payload.statusCode).json(payload.reviews);
});

// get a review by isbn and username
ReviewRouter.get('/:username/book/:isbn', async (req: Request, res: Response) => {
  const payload = await ReviewService.getReview(req.params.isbn, req.params.username);
  res.status(payload.statusCode).json(payload.review);
});

// ROUTES THAT REQUIRE AUTHORIZATION

// post review
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

// put review
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

// delete review
ReviewRouter.delete('/:username/book/:isbn', [
  verifyToken,
  async (req: Request, res: Response) => {
    const payload = await ReviewService.deleteReview(req.params.isbn, req.params.username);
    res.status(payload.statusCode).json(payload.message);
  },
]);

export default ReviewRouter;
