import User, { view } from '../../api/user/model';

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

export const create = async (user) => {
  try {
    const createdUser = await User.create(user);
    return view(createdUser, true);
  } catch (e) {
    let error = UserServiceError('failed to create user');
    if (e.name === 'MongoError' && e.code === 11000) {
      error = UserServiceEmailRegisteredError('email already registered');
    }
    return Promise.reject(error);
  }
};
