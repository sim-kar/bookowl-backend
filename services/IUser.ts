import mongoose from 'mongoose';

export default interface IUser extends mongoose.Document {
  username: string;
  email: string;
  password: string;
  joined: string;
}
