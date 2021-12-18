import mongoose from 'mongoose';
import IStatus from '../services/IStatus';
import Constants from '../utils/Constants';

const statusSchema = new mongoose.Schema<IStatus>({
  isbn: { type: String, required: true },
  username: { type: String, required: true },
  status: { // 0: want to read, 1: reading, 2: read
    type: Number,
    min: 0,
    max: 2,
    required: true,
  },
  date: { type: String, match: Constants.DATE_REGEX, required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
});

// make the combined fields isbn and username a compound index and make the combined fields unique
statusSchema.index({ isbn: 1, username: 1 }, { unique: true });

// add collection name manually since mongoose gets it wrong otherwise
const Status = mongoose.model<IStatus>('Status', statusSchema, 'statuses');

export default Status;
