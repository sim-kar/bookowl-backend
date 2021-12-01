import express from 'express';
import StatusService from '../services/status-service';

const router = express.Router();

// get statuses for a user
router.get('/', async (req, res) => {
  const payload = await StatusService.getStatuses(req.body.username, req.body.status);
  res.status(payload.statusCode).json(payload.statuses);
});

// get a status by isbn and username
router.get('/:isbn', async (req, res) => {
  const payload = await StatusService.getStatus(req.params.isbn, req.body.username);
  res.status(payload.statusCode).json(payload.status);
});

// post status
router.post('/', async (req, res) => {
  const payload = await StatusService.addStatus(req.body.isbn, req.body.username, req.body.status);
  res.status(payload.statusCode).json(payload.message);
});

// put status
router.put('/', async (req, res) => {
  const payload = await StatusService.updateStatus(
    req.body.isbn,
    req.body.username,
    req.body.status,
  );
  res.status(payload.statusCode).json(payload.message);
});

// delete status
router.delete('/:isbn', async (req, res) => {
  const payload = await StatusService.deleteStatus(req.params.isbn, req.body.username);
  res.status(payload.statusCode).json(payload.message);
});

export default router;
