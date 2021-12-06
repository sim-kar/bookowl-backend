import express from 'express';
import UserService from '../services/user-service';

const router = express.Router();

// get a user
router.get('/', async (req, res) => {
  const payload = await UserService.getUser(req.body.username);
  res.status(payload.statusCode).json(payload.user);
});

// FIXME: get a user by email?

// post user
router.post('/', async (req, res) => {
  const payload = await UserService.addUser(req.body.username, req.body.email, req.body.password);
  res.status(payload.statusCode).json(payload.message);
});

// put user
router.put('/', async (req, res) => {
  const payload = await UserService.updateUser(
    req.body.username,
    req.body.email,
    req.body.password,
  );
  res.status(payload.statusCode).json(payload.message);
});

export default router;
