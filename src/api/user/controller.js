import { success, notFound, conflict } from '../../services/response';
import { create as createUser } from '../../services/user-service';
import { User } from '.';

export const index = ({ querymen: { query, select, cursor } }, res, next) => User.find(query, select, cursor)
  .then(users => users.map(user => user.view()))
  .then(success(res))
  .catch(next);

export const show = ({ params }, res, next) => User.findById(params.id)
  .then(notFound(res))
  .then(user => (user ? user.view() : null))
  .then(success(res))
  .catch(next);

export const showMe = ({ user }, res) => res.json(user.view(true));

export const create = ({ bodymen: { body } }, res, next) => createUser(body)
  .then(success(res, 201))
  .catch(conflict);

export const update = ({ bodymen: { body }, params, user }, res, next) => User.findById(params.id === 'me' ? user.id : params.id)
  .then(notFound(res))
  .then((result) => {
    if (!result) return null;
    const isAdmin = user.role === 'admin';
    const isSelfUpdate = user.id === result.id;
    if (!isSelfUpdate && !isAdmin) {
      res.status(401).json({
        valid: false,
        message: 'You can\'t change other user\'s data',
      });
      return null;
    }
    return result;
  })
  .then(user => (user ? Object.assign(user, body).save() : null))
  .then(user => (user ? user.view(true) : null))
  .then(success(res))
  .catch(next);

export const updatePassword = ({ bodymen: { body }, params, user }, res, next) => User.findById(params.id === 'me' ? user.id : params.id)
  .then(notFound(res))
  .then((result) => {
    if (!result) return null;
    const isSelfUpdate = user.id === result.id;
    if (!isSelfUpdate) {
      res.status(401).json({
        valid: false,
        param: 'password',
        message: 'You can\'t change other user\'s password',
      });
      return null;
    }
    return result;
  })
  .then(user => (user ? user.set({ password: body.password }).save() : null))
  .then(user => (user ? user.view(true) : null))
  .then(success(res))
  .catch(next);

export const destroy = ({ params }, res, next) => User.findById(params.id)
  .then(notFound(res))
  .then(user => (user ? user.remove() : null))
  .then(success(res, 204))
  .catch(next);
