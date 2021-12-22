import User from '../models/User';
import DateUtils from '../utils/DateUtils';

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
    if (await User.exists({ $or: [{ username }, { email }] })) {
      return { statusCode: 409, message: { error: 'Username or email already exists.' } };
    }

    const newUser = new User({
      username,
      email,
      password,
      gender,
      birthdate,
      joined: DateUtils.formatDate(new Date()),
    });

    try {
      await newUser.save();
    } catch (error) {
      return { statusCode: 500, message: { error: 'Unable to add user.' } };
    }

    return { statusCode: 201, message: { message: 'Added user.' } };
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
    foundUser.password = password;

    try {
      await foundUser.save();
    } catch (error) {
      return { statusCode: 500, message: { error: 'Unable to update user.' } };
    }

    return { statusCode: 200, message: { message: 'Updated user' } };
  }
}
