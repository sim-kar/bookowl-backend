import mongoose from 'mongoose';
import IUser from '../services/IUser';
import CONSTANTS from '../utils/CONSTANTS';

const userSchema = new mongoose.Schema<IUser>({
  username: {
    type: String,
    index: true,
    unique: true,
    minlength: 2,
    maxlength: 20,
    required: true,
  },
  email: {
    type: String,
    match: CONSTANTS.emailRegex,
    unique: true,
    required: true,
  },
  password: { type: String, minlength: 8, required: true },
  gender: { type: String, enum: ['male', 'female', 'other', 'private'], required: true },
  birthdate: { type: Date, required: true },
  joined: { type: Date, required: true },
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;
