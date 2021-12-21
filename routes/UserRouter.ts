import express from 'express';
import UserService from '../services/UserService';

const UserRouter = express.Router();

// get a user
UserRouter.get('/:username', async (req, res) => {
  const payload = await UserService.getUser(req.params.username);
  res.status(payload.statusCode).json(payload.user);
});

// post user
UserRouter.post('/', async (req, res) => {
  const payload = await UserService.addUser(
    req.body.username,
    req.body.email,
    req.body.password,
    req.body.gender,
    req.body.birthdate,
  );
  res.status(payload.statusCode).json(payload.message);
});

// put user
UserRouter.put('/', async (req, res) => {
  const payload = await UserService.updateUser(
    req.body.username,
    req.body.email,
    req.body.password,
  );
  res.status(payload.statusCode).json(payload.message);
});

export default UserRouter;
