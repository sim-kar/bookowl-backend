import mongoose from 'mongoose';

export default interface IBook extends mongoose.Document {
  isbn: string;
  title: string;
  author: string;
  cover: string;
  pages: number;
  published: string;
  publisher: string;
  language: string;
}
