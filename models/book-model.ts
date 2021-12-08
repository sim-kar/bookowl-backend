import mongoose from 'mongoose';
import IBook from '../services/IBook';

// regex used to validate date with format yyyy-mm-dd
const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/;

const bookSchema = new mongoose.Schema<IBook>({
  isbn: { type: String, index: true, unique: true },
  title: { type: String, required: true },
  authors: { type: [String], required: true },
  cover: { type: String, required: true },
  pages: { type: Number, required: true },
  published: { type: String, match: dateRegex, required: true },
  publisher: { type: String, required: true },
  language: { type: String, required: true },
  description: { type: String, required: true },
  categories: { type: [String], required: true },
});

const Book = mongoose.model<IBook>('Book', bookSchema);

export default Book;
