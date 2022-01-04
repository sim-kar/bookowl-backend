import mongoose from 'mongoose';
import IBook from './IBook';

/**
 * A user status for a book, i.e. whether the user has read the book, is reading it, or wants to
 * read it. Contains a reference to the book.
 * */
export default interface IStatus extends mongoose.Document {
  isbn: string;
  username: string;
  status: number; // 0: want to read, 1: reading, 2: read
  date: Date;
  book: IBook;
}
