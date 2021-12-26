import jwt from 'jsonwebtoken';
import config from 'config';
import { Request, Response } from 'express';

export default function verifyToken(req: Request, res: Response, next: Function) {
  const token: string = <string>req.headers['x-access-token'];
  const secret: string = config.get('jwt.secret');

  if (!token) {
    res.status(403).json({ message: 'No token provided.' });
  } else {
    try {
      // check if the token is valid. Will throw error otherwise
      jwt.verify(token, secret);
      next();
    } catch (error) {
      res.status(401).json({ message: 'Unauthorized.' });
    }
  }
}
