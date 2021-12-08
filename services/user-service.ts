import User from '../models/user-model';

export default class UserService {
  // get user by username
  static async getUser(username: string) {
    // don't return the password
    const foundUser = await User.findOne({ username }, ['-_id', '-__v', '-password']);

    if (!foundUser) {
      // FIXME: use 204 No Content with empty data instead of 404?
      // see discussion here: https://stackoverflow.com/questions/11746894/what-is-the-proper-rest-response-code-for-a-valid-request-but-an-empty-data
      return { statusCode: 204, user: {} };
    }

    return { statusCode: 200, user: foundUser };
  }

  // FIXME: get user from email?

  // add a new user
  static async addUser(username: string, email: string, password: string) {
    if (await User.exists({ $or: [{ username }, { email }] })) {
      return { statusCode: 409, message: { error: 'Username or email already exists.' } };
    }

    const newUser = new User({
      username,
      email,
      password,
      joined: UserService.#formatDate(new Date()),
    });

    try {
      await newUser.save();
    } catch (error) {
      return { statusCode: 500, message: { error: 'Unable to add user.' } };
    }

    return { statusCode: 201, message: { message: 'Added user.' } };
  }

  // update a user
  static async updateUser(username: string, email: string, password: string) {
    const foundUser = await User.findOne({ username });

    if (!foundUser) {
      // FIXME: use 204 No Content with empty data instead of 404?
      // see discussion here: https://stackoverflow.com/questions/11746894/what-is-the-proper-rest-response-code-for-a-valid-request-but-an-empty-data
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
      // FIXME: is 500 Internal Sever Error the correct code? 'the server encountered an unexpected
      //  condition that prevented it from fulfilling the request'
      return { statusCode: 500, message: { error: 'Unable to update user.' } };
    }

    return { statusCode: 200, message: { message: 'Updated user' } };
  }

  static #formatDate(date: Date) {
    return [
      date.getFullYear(),
      (date.getMonth() + 1).toString().padStart(2, '0'),
      date.getDate().toString().padStart(2, '0'),
    ].join('-');
  }
}
