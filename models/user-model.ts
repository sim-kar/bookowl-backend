import mongoose from 'mongoose';
import IUser from '../services/IUser';

// regex used to validate date with format yyyy-mm-dd
const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/;
// regex used to validate email according to WHATWG standard: https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address
const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const userSchema = new mongoose.Schema<IUser>({
  username: { type: String, index: true, unique: true },
  email: { type: String, match: emailRegex, unique: true },
  password: { type: String, required: true },
  joined: { type: String, match: dateRegex, required: true },
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;
