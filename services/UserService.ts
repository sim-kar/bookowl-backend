import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import EnvironmentVariables from '../config/EnvironmentVariables';

/** Provides access to users in the database. */
export default class UserService {
  /**
   * Get a user.
   *
   * @param username the user's username.
   * @returns the HTTP status code and user.
   */
  static async getUser(username: string) {
    // don't return the password and email, its sensitive information
    const foundUser = await User.findOne({ username }, ['-_id', '-__v', '-password', '-email']);

    if (!foundUser) {
      return { statusCode: 204, user: {} };
    }

    return { statusCode: 200, user: foundUser };
  }

  /**
   * Add a user.
   *
   * @param username the username.
   * @param email the email.
   * @param password the password.
   * @param gender the gender.
   * @param birthdate the birthdate.
   * @returns the HTTP status code and result message.
   */
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

  /**
   * Authenticate a user for log in.
   *
   * @param username the user's username.
   * @param password the user's password.
   * @returns the HTTP status code, access token, username, and result message.
   */
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

    const secret: string = EnvironmentVariables.JWT_SECRET;
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

  /**
   * Get a user's email address. Since it is sensitive information,
   * the returned address is censored.
   *
   * @param username the user's username.
   * @returns the censored email.
   */
  static async getUserEmail(username: string) {
    const foundUser = await User.findOne({ username });

    if (!foundUser) {
      return { statusCode: 204, email: {} };
    }

    // censor the last half
    const localPartLength = foundUser.email.indexOf('@');
    const half = Math.floor(localPartLength / 2);

    const email = foundUser.email.substring(0, half)
      + '*'.repeat(3)
      + foundUser.email.substring(localPartLength);

    return { statusCode: 200, email };
  }

  /**
   * Updates a user's email address. The user's password is required for authentication.
   *
   * @param username the user's username.
   * @param email the new email.
   * @param password the user's password.
   * @returns the HTTP status code and result message.
   */
  static async updateUserEmail(username: string, email: string, password: string) {
    const foundUser = await User.findOne({ username });

    if (!foundUser) {
      return { statusCode: 404, message: { error: "User doesn't exist." } };
    }

    // validate password
    const validPassword = await argon2.verify(
      foundUser.password,
      password,
      { type: argon2.argon2id },
    );

    if (!validPassword) {
      return { statusCode: 401, message: { error: 'Password is invalid.' } };
    }

    // check if another user is already using new email
    if (await User.exists({ username: { $ne: username }, email })) {
      return { statusCode: 409, message: { error: 'E-mail already exist.' } };
    }

    foundUser.email = email;

    try {
      await foundUser.save();
    } catch (error) {
      return { statusCode: 500, message: { error: 'Unable to update email.' } };
    }

    return { statusCode: 200, message: { message: 'Updated email.' } };
  }

  /**
   * Update a user's password. The old password is required for authentication.
   *
   * @param username the user's username.
   * @param newPassword the new password.
   * @param password the user's current password.
   */
  static async updateUserPassword(username: string, newPassword: string, password: string) {
    const foundUser = await User.findOne({ username });

    if (!foundUser) {
      return { statusCode: 404, message: { error: "User doesn't exist." } };
    }

    // validate password
    const validPassword = await argon2.verify(
      foundUser.password,
      password,
      { type: argon2.argon2id },
    );

    if (!validPassword) {
      return { statusCode: 401, message: { error: 'Password is invalid.' } };
    }

    // add new password
    foundUser.password = await argon2.hash(newPassword, { type: argon2.argon2id });

    try {
      await foundUser.save();
    } catch (error) {
      return { statusCode: 500, message: { error: 'Unable to update password.' } };
    }

    return { statusCode: 200, message: { message: 'Updated password.' } };
  }
}
