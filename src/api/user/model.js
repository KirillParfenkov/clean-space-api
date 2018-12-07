import crypto from 'crypto';
import mongoose, { Schema } from 'mongoose';
import { env } from '../../config';

export const roles = ['client', 'service', 'admin'];
export const accessList = ['auth'];

const token = new Schema({
  token: {
    type: String,
    required: true,
  },
  access: {
    type: String,
    enum: accessList,
    default: 'auth',
  },
});

const userSchema = new Schema({
  email: {
    type: String,
    match: /^\S+@\S+\.\S+$/,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 3,
  },
  name: {
    type: String,
    index: true,
    trim: true,
  },
  role: {
    type: String,
    enum: roles,
    default: 'client',
  },
  picture: {
    type: String,
    trim: true,
  },
  tokens: [token],
}, {
  timestamps: true,
});

userSchema.path('email').set(function (email) {
  if (!this.picture || this.picture.indexOf('https://gravatar.com') === 0) {
    const hash = crypto.createHash('md5').update(email).digest('hex');
    this.picture = `https://gravatar.com/avatar/${hash}?d=identicon`;
  }

  if (!this.name) {
    this.name = email.replace(/^(.+)@.+$/, '$1');
  }

  return email;
});

export const view = (user, full) => {
  const viewObject = {};
  let fields = ['id', 'name', 'picture'];

  if (full) {
    fields = [...fields, 'email', 'createdAt'];
  }

  fields.forEach((field) => { viewObject[field] = user[field]; });

  return viewObject;
};

userSchema.statics = {
  roles,
};

const model = mongoose.model('User', userSchema);

export const schema = model.schema;
export default model;
