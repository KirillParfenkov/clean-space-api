import { sign } from '../../services/jwt';
import { success } from '../../services/response';
import { createAuthToken } from '../../services/user-service';

export const login = ({ user }, res, next) => sign(user.id)
  .then(createAuthToken(user))
  .then(success(res, 201))
  .catch(next);
