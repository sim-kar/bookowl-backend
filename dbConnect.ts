import mongoose from 'mongoose';
import EnvironmentVariables from './config/EnvironmentVariables';

/** Connect to database. */
export default async function dbConnect() {
  await mongoose.connect(EnvironmentVariables.DATABASE_URL)
    .catch((error) => {
      throw new Error(error);
    });
}
