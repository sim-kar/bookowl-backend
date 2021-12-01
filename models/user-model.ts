import mongoose from 'mongoose';
import IUser from '../services/IUser';

const userSchema = new mongoose.Schema<IUser>({
  username: String,
  email: String,
  password: String,
  joined: String, // yyyy-mm-dd. TODO: validation
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;
