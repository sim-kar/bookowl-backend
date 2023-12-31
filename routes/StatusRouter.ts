import express, { Request, Response } from 'express';
import StatusService from '../services/StatusService';
import NumberUtils from '../utils/NumberUtils';
import verifyToken from '../middlewares/verifyToken';

const StatusRouter = express.Router();

/** Get a user's statuses by status code */
StatusRouter.get('/:username/status/:status', async (req: Request, res: Response) => {
  const status = NumberUtils.getNumber(req.params.status);

  const payload = await StatusService.getStatuses(req.params.username, status);
  res.status(payload.statusCode).json(payload.statuses);
});

/** Get a status by ISBN and username */
StatusRouter.get('/:username/book/:isbn', async (req: Request, res: Response) => {
  const payload = await StatusService.getStatus(req.params.isbn, req.params.username);
  res.status(payload.statusCode).json(payload.status);
});

// ROUTES THAT REQUIRE AUTHORIZATION

/** Post a status */
StatusRouter.post('/', [
  verifyToken,
  async (req: Request, res: Response) => {
    const payload = await StatusService.addStatus(
      req.body.isbn,
      req.body.username,
      req.body.status,
      req.body.book,
    );
    res.status(payload.statusCode).json(payload.message);
  },
]);

/** Update a status */
StatusRouter.put('/', [
  verifyToken,
  async (req: Request, res: Response) => {
    const payload = await StatusService.updateStatus(
      req.body.isbn,
      req.body.username,
      req.body.status,
    );
    res.status(payload.statusCode).json(payload.message);
  },
]);

/** Delete a status */
StatusRouter.delete('/:username/book/:isbn', [
  verifyToken,
  async (req: Request, res: Response) => {
    const payload = await StatusService.deleteStatus(req.params.isbn, req.params.username);
    res.status(payload.statusCode).json(payload.message);
  },
]);

export default StatusRouter;
