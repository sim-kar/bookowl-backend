import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import config from 'config';
import User from '../models/User';

export default class UserService {
  // get user by username
  static async getUser(username: string) {
    // don't return the password
    const foundUser = await User.findOne({ username }, ['-_id', '-__v', '-password']);

    if (!foundUser) {
      return { statusCode: 204, user: {} };
    }

    return { statusCode: 200, user: foundUser };
  }

  // add a new user
  static async addUser(
    username: string,
    email: string,
    password: string,
    gender: string,
    birthdate: string,
  ) {
    if (await User.exists({ username })) {
      return { statusCode: 409, message: { error: 'Username already exists.' } };
    }

    if (await User.exists({ email })) {
      return { statusCode: 409, message: { error: 'E-mail already exists.' } };
    }

    const newUser = new User({
      username,
      email,
      password: await argon2.hash(password, { type: argon2.argon2id }),
      gender,
      birthdate: new Date(birthdate),
      joined: new Date(),
    });

    try {
      await newUser.save();
    } catch (error) {
      return { statusCode: 500, message: { error: 'Unable to add user.' } };
    }

    return { statusCode: 201, message: { message: 'Added user.' } };
  }

  static async logIn(username: string, password: string) {
    const foundUser = await User.findOne({ username });

    if (!foundUser) {
      return {
        statusCode: 404,
        accessToken: null,
        username: null,
        message: { error: "User doesn't exist." },
      };
    }

    const validPassword = await argon2.verify(
      foundUser.password,
      password,
      { type: argon2.argon2id },
    );

    if (!validPassword) {
      return {
        statusCode: 401,
        accessToken: null,
        username: null,
        message: { error: 'Password is invalid.' },
      };
    }

    const secret: string = config.get('jwt.secret');
    const token = jwt.sign(
      {},
      secret,
      // expiration time 24 hours
      { expiresIn: 86400, subject: username },
    );

    return {
      statusCode: 200,
      accessToken: token,
      username,
      message: { message: 'Successfully logged in.' },
    };
  }

  // update a user (e-mail or password)
  static async updateUser(username: string, email: string, password: string) {
    const foundUser = await User.findOne({ username });

    if (!foundUser) {
      return { statusCode: 404, message: { error: "User doesn't exist." } };
    }

    // make sure the email doesn't already exist if updating the email
    if (foundUser.email !== email) {
      // check if another user is already using new email
      if (await User.exists({ username: { $ne: username }, email })) {
        return { statusCode: 409, message: { error: 'E-mail already exist.' } };
      }
    }

    foundUser.email = email;
    foundUser.password = await argon2.hash(password, { type: argon2.argon2id });

    try {
      await foundUser.save();
    } catch (error) {
      return { statusCode: 500, message: { error: 'Unable to update user.' } };
    }

    return { statusCode: 200, message: { message: 'Updated user.' } };
  }
}
