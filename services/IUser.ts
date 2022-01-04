import mongoose from 'mongoose';

/** A user identified by a unique username. */
export default interface IUser extends mongoose.Document {
  username: string;
  email: string;
  password: string;
  gender: string;
  birthdate: Date;
  joined: Date;
}
