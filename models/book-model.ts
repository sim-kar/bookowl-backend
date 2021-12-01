import mongoose from 'mongoose';
import IBook from '../services/IBook';

// TODO: model schema after public API
// author as array?
const bookSchema = new mongoose.Schema<IBook>({
  isbn: { type: String, index: true, unique: true },
  title: String,
  author: String,
  cover: String,
  pages: Number,
  published: String, // yyyy-mm-dd. TODO: validation
  publisher: String,
  language: String,
});

const Book = mongoose.model<IBook>('Book', bookSchema);

export default Book;
