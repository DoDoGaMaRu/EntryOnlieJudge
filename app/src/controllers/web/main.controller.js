import { ROLE as R } from '#middlewares/session.middleware.js';
import uService from '#services/user.service.js';
import mService from '#services/mission.service.js';
import wService from '#services/workspace.service.js';

export async function renderMainpage(req, res) {
  const { userId, role } = req.session.user;
  let user = {};
  let clearCount = 0;
  let missionProgresses = []
  // 미션 목록 가져오기
  if (role !== R.GUEST) {
    user = await uService.findUserWithGroup(userId);
    clearCount = await uService.countClearedProblem(userId);
    missionProgresses = await mService.findMissionProgressesWithMission(userId, true);
  }
  return res.render('pages/rookieMain', { user, clearCount, missionProgresses });
}

export async function renderSearch(req, res) {
  const { userId, role } = req.session.user;
  const { query } = req.query;

  const workspaces = await wService.findWorkspacesByQuery(query);
  return res.render('pages/search', { workspaces });
}