import mongoose from 'mongoose';
import IStatus from '../services/IStatus';

const statusSchema = new mongoose.Schema<IStatus>({
  isbn: String,
  username: String,
  status: String, // TODO: validation 'want to read', 'reading', 'read'
});

// add collection name manually since mongoose gets it wrong otherwise
const Status = mongoose.model<IStatus>('Status', statusSchema, 'statuses');

export default Status;
