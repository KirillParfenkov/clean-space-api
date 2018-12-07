import passport from 'passport';
import { BasicStrategy } from 'passport-http';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

import { jwtSecret, masterKey } from '../../config';
import User from '../../api/user/model';
import { getUserByCredentials } from '../user-service';

export const password = () => (req, res, next) => passport.authenticate('password', { session: false }, (err, user, info) => {
  if (err && err.param) {
    return res.status(400).json(err);
  } if (err || !user) {
    return res.status(401).end();
  }
  req.logIn(user, { session: false }, (err) => {
    if (err) return res.status(401).end();
    next();
  });
})(req, res, next);

export const master = () => passport.authenticate('master', { session: false });

export const token = ({ required, roles = User.roles } = {}) => (req, res, next) => passport.authenticate('token', { session: false }, (err, user, info) => {
  if (err || (required && !user) || (required && !~roles.indexOf(user.role))) {
    return res.status(401).end();
  }
  req.logIn(user, { session: false }, (err) => {
    if (err) return res.status(401).end();
    next();
  });
})(req, res, next);

passport.use('password', new BasicStrategy(async (email, pass, done) => {
  try {
    const user = await getUserByCredentials(email, pass);
    done(null, user);
  } catch (e) {
    done(e);
  }
}));

passport.use('master', new BearerStrategy((token, done) => {
  if (token === masterKey) {
    done(null, {});
  } else {
    done(null, false);
  }
}));

passport.use('token', new JwtStrategy({
  secretOrKey: jwtSecret,
  jwtFromRequest: ExtractJwt.fromExtractors([
    ExtractJwt.fromUrlQueryParameter('access_token'),
    ExtractJwt.fromBodyField('access_token'),
    ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
  ]),
}, ({ id }, done) => {
  User.findById(id).then((user) => {
    done(null, user);
    return null;
  }).catch(done);
}));
