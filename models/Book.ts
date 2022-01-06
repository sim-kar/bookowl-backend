import mongoose from 'mongoose';
import IBook from '../services/IBook';
import CONSTANTS from '../utils/CONSTANTS';

const bookSchema = new mongoose.Schema<IBook>({
  isbn: {
    type: String,
    index: true,
    unique: true,
    required: true,
  },
  title: { type: String, required: true },
  authors: { type: [String], required: true },
  cover: { type: String, required: true },
  pages: { type: Number, required: true },
  published: { type: String, match: CONSTANTS.publishedDateRegex, required: true },
  publisher: { type: String, required: true },
  language: { type: String, required: true },
  description: { type: String, required: true },
  categories: { type: [String], required: true },
});

const Book = mongoose.model<IBook>('Book', bookSchema);

export default Book;
