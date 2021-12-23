import mongoose from 'mongoose';
import IBook from './IBook';

export default interface IReview extends mongoose.Document {
  isbn: string;
  username: string;
  stars: number;
  text: string;
  date: Date;
  book: IBook;
}
