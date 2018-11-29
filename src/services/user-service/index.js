import User, { view } from '../../api/user/model';

export const UserServiceError = message => Error(`User service error: ${message}`);

export const create = async (user) => {
  try {
    const createdUser = await User.create(user);
    return view(createdUser, true);
  } catch (e) {
    if (e.name === 'MongoError' && e.code === 11000) {
      throw UserServiceError('email already registered');
    }
    throw UserServiceError('failed to create user');
  }
};
