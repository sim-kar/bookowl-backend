import mongoose from 'mongoose';
import IBook from './IBook';

export default interface IStatus extends mongoose.Document {
  isbn: string;
  username: string;
  status: string;
  book: IBook;
}
