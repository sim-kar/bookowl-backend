import express, { Request, Response } from 'express';
import UserService from '../services/UserService';
import verifyToken from '../middlewares/verifyToken';

const UserRouter = express.Router();

// get a user
UserRouter.get('/:username', async (req: Request, res: Response) => {
  const payload = await UserService.getUser(req.params.username);
  res.status(payload.statusCode).json(payload.user);
});

// post user
UserRouter.post('/', async (req: Request, res: Response) => {
  const payload = await UserService.addUser(
    req.body.username,
    req.body.email,
    req.body.password,
    req.body.gender,
    req.body.birthdate,
  );
  res.status(payload.statusCode).json(payload.message);
});

// log in
UserRouter.post('/login', async (req: Request, res: Response) => {
  const payload = await UserService.logIn(
    req.body.username,
    req.body.password,
  );
  res.status(payload.statusCode).json({
    accessToken: payload.accessToken,
    username: payload.username,
    message: payload.message,
  });
});

// ROUTES THAT REQUIRE AUTHORIZATION

// get a user email
UserRouter.get('/:username/email', [
  verifyToken,
  async (req: Request, res: Response) => {
    const payload = await UserService.getUserEmail(req.params.username);
    res.status(payload.statusCode).json(payload.email);
  },
]);

// put user email
UserRouter.put('/email', [
  verifyToken,
  async (req: Request, res: Response) => {
    const payload = await UserService.updateUserEmail(
      req.body.username,
      req.body.email,
      req.body.password,
    );
    res.status(payload.statusCode).json(payload.message);
  },
]);

// put user password
UserRouter.put('/password', [
  verifyToken,
  async (req: Request, res: Response) => {
    const payload = await UserService.updateUserPassword(
      req.body.username,
      req.body.newPassword,
      req.body.oldPassword,
    );
    res.status(payload.statusCode).json(payload.message);
  },
]);

export default UserRouter;
