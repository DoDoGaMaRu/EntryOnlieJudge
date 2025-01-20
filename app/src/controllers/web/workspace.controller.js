import { ROLE as R } from '#middlewares/session.middleware.js';
import uService from '#services/user.service.js';
import wService from '#services/workspace.service.js';

export async function renderWorkspace(req, res) {
  const { userId } = req.session.user;
  const { workspaceOid } = req.params;

  return res.render('pages/workspacePage', { workspaceOid });
}
