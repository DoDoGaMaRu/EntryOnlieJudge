import _ from 'lodash';
import createError from 'http-errors';

const ROLE = {
  GUEST: 1,
  USER: 2,
  TEACHER: 4,
  ADMIN: 5
}

const admins = new Set()
const teachers = new Set()

const guestInfo = {
  userId: '',
  role: ROLE.GUEST,
}


export function getAccessModifier(minimumRole) {
  return async (req, res, next) => {
    if (req.session.user) {
      const { role } = req.session.user;
      if (minimumRole <= role) {
        return next();
      }
    }
    return next(createError(403));
  }
}

export async function sessionSync(req, res, next) {
  const { PHPSESSID: sessionId } = req.cookies;
  const userInfo = {};
  let isGuest = true;

  if (sessionId) {
    const res = await fetch('[세션 인증 URL]', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId })
    });
    const { mb_id, mb_level, mb_name } = await res.json();

    isGuest = mb_level === ROLE.GUEST;
    if (!isGuest) {
      userInfo.userId = mb_id;
      userInfo.role = teachers.has(mb_id)? ROLE.TEACHER
                    : admins.has(mb_id)? ROLE.ADMIN
                    : parseInt(mb_level);
      userInfo.userName = mb_name;
    }
  }

  req.session.user = Object.assign({}, req.session.user, isGuest? guestInfo:userInfo);
  req.session.lastAccess = Date.now();
  return next();
}

export { ROLE, admins, teachers };
