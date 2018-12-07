import User, { view } from '../../api/user/model';
import { hash, compareHash } from '../utils';

export class UserServiceError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UserServiceError';
  }
}

export class UserServiceEmailRegisteredError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UserServiceEmailRegisteredError';
  }
}

export const create = async ({ password, ...otherUserProps }) => {
  try {
    const user = {
      ...otherUserProps,
      password: await hash(password),
    };

    const createdUser = await User.create(user);
    return view(createdUser, true);
  } catch (e) {
    let error = new UserServiceError('failed to create user');
    if (e.name === 'MongoError' && e.code === 11000) {
      error = new UserServiceEmailRegisteredError('email already registered');
    }
    return Promise.reject(error);
  }
};

export const attachAuthToken = userId => async (token) => {
  const user = await User.findById(userId);
  user.tokens.push({
    token,
  });
  await user.save();
  return token;
};

export const getUserByCredentials = async (email, password) => {
  const user = await User.findOne({ email }).exec();
  if (!user) {
    return null;
  }

  const confirmed = await compareHash(password, user.password);
  if (confirmed) {
    return user;
  }
  return null;
};
