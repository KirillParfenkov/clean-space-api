import User, { view } from '../../api/user/model';

export const UserServiceError = message => Error(`User service error: ${message}`);

export const create = async (user) => {
  try {
    console.log('create', user);
    const createdUser = await User.create(user);
    return view(createdUser, true);
  } catch (e) {
    console.log('error', e);
    let error = UserServiceError('failed to create user');
    if (e.name === 'MongoError' && e.code === 11000) {
      error = UserServiceError('email already registered');
    }
    return Promise.reject(error);
  }
};
