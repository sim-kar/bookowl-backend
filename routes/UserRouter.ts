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

// put user
UserRouter.put('/', [
  verifyToken,
  async (req: Request, res: Response) => {
    const payload = await UserService.updateUser(
      req.body.username,
      req.body.email,
      req.body.password,
    );
    res.status(payload.statusCode).json(payload.message);
  },
]);

// log in
UserRouter.post('/login', async (req: Request, res: Response) => {
  const payload = await UserService.logIn(
    req.body.username,
    req.body.password,
  );
  res.status(payload.statusCode).json({
    accessToken: payload.accessToken,
    username: payload.username,
  });
});

export default UserRouter;
