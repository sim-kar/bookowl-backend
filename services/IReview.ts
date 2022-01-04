import mongoose from 'mongoose';
import IBook from './IBook';

/** A book review by a user. Contains a reference to the reviewed book. */
export default interface IReview extends mongoose.Document {
  isbn: string;
  username: string;
  stars: number;
  text: string;
  date: Date;
  book: IBook;
}
