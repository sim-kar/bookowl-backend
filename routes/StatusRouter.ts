import express from 'express';
import StatusService from '../services/StatusService';
import NumberUtils from '../utils/NumberUtils';

const StatusRouter = express.Router();

// get statuses for a user
StatusRouter.get('/:username/status/:status', async (req, res) => {
  const status = NumberUtils.getNumber(req.params.status);

  const payload = await StatusService.getStatuses(req.params.username, status);
  res.status(payload.statusCode).json(payload.statuses);
});

// get a status by isbn and username
StatusRouter.get('/:username/book/:isbn', async (req, res) => {
  const payload = await StatusService.getStatus(req.params.isbn, req.params.username);
  res.status(payload.statusCode).json(payload.status);
});

// post status
StatusRouter.post('/', async (req, res) => {
  const payload = await StatusService.addStatus(
    req.body.isbn,
    req.body.username,
    req.body.status,
    req.body.book,
  );
  res.status(payload.statusCode).json(payload.message);
});

// put status
StatusRouter.put('/', async (req, res) => {
  const payload = await StatusService.updateStatus(
    req.body.isbn,
    req.body.username,
    req.body.status,
  );
  res.status(payload.statusCode).json(payload.message);
});

// delete status
StatusRouter.delete('/:username/book/:isbn', async (req, res) => {
  const payload = await StatusService.deleteStatus(req.params.isbn, req.params.username);
  res.status(payload.statusCode).json(payload.message);
});

export default StatusRouter;
