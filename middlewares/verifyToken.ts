import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import EnvironmentVariables from '../config/EnvironmentVariables';

/**
 * Verifies a JSON Web Token to make sure the request is authorized to use the route.
 *
 * @param req the request object
 * @param res the response object
 * @param next the next middleware function
 */
export default function verifyToken(req: Request, res: Response, next: Function) {
  const token: string = <string>req.headers['x-access-token'];
  const secret: string = EnvironmentVariables.JWT_SECRET;
  // get the username from either request parameters or body
  const username = req.params.username ? req.params.username : req.body.username;

  if (!token) {
    res.status(403).json({ message: 'No token provided.' });
  } else {
    try {
      // check if the token is valid. Will throw error otherwise
      jwt.verify(token, secret, { subject: username });
      next();
    } catch (error) {
      res.status(401).json({ message: 'Unauthorized.' });
    }
  }
}
