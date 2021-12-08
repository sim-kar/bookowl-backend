import mongoose from 'mongoose';
import IBook from './IBook';

export default interface IStatus extends mongoose.Document {
  isbn: string;
  username: string;
  status: number; // 0: want to read, 1: reading, 2: read
  book: IBook;
}
