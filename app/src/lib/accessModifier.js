export default function accessModifier(allowRoles) {
  return (req, res, next) => {
    if (req.session.user) {
      const { role } = req.session.user;
      if (allowRoles.includes(role)) {
        return next();
      }
    }
    return res.status(403).send('올바르지 않은 접근');
  }
}