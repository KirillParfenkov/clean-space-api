import bcrypt from 'bcryptjs';

export const hash = (password, saltRounds = 10) => bcrypt.hash(password, saltRounds);

export const compareHash = (password, hash) => bcrypt.compare(password, hash);
