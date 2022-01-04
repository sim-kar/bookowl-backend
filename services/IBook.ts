import mongoose from 'mongoose';

/** A book identified by a unique ISBN. */
export default interface IBook extends mongoose.Document {
  isbn: string;
  title: string;
  authors: string[];
  cover: string;
  pages: number;
  published: string;
  publisher: string;
  language: string;
  description: string;
  categories: string[];
}
