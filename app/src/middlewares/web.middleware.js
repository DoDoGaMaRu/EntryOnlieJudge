import uService from '#services/user.service.js';
import { ROLE } from '#middlewares/session.middleware.js';

const userCache = new Set();

export function setDefaultData(req, res, next) {
  const { userId, role } = req.session.user;

  res.locals._user = { userId, role };
  res.locals._ROLE = ROLE;
  
  next();
}

export async function handleNewUser(req, res, next) {
  const { userId, role } = req.session.user;
  if (role!==ROLE.GUEST && !userCache.has(userId)) {
    await uService.initUser(userId);
    userCache.add(userId);
  }
  next();
}