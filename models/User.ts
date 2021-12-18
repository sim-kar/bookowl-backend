import mongoose from 'mongoose';
import IUser from '../services/IUser';
import Constants from '../utils/Constants';

const userSchema = new mongoose.Schema<IUser>({
  username: { type: String, index: true, unique: true },
  email: { type: String, match: Constants.EMAIL_REGEX, unique: true },
  password: { type: String, required: true },
  gender: { type: String, enum: ['male', 'female', 'other', 'private'], required: true },
  birthdate: { type: String, match: Constants.DATE_REGEX, required: true },
  joined: { type: String, match: Constants.DATE_REGEX, required: true },
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;
