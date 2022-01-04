import config from 'config';
import mongoose from 'mongoose';

const {
  dbName,
  host,
  port: dbPort,
  username,
  password,
} = config.get('bookDB.dbConfig');

/** Connect to database. */
export default async function dbConnect() {
// `mongodb://${username}:${password}@${host}:${dbPort}/${dbName}`
  await mongoose.connect(`mongodb://${host}:${dbPort}/${dbName}`)
    .catch((error) => {
      throw new Error(error);
    });
}
