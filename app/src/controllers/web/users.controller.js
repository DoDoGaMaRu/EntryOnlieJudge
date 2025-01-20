import createError from 'http-errors';

import { ROLE as R } from "#middlewares/session.middleware.js";

import uService from "#services/user.service.js";
import wService from '#services/workspace.service.js';
import gService from "#services/group.service.js";
import mService from "#services/mission.service.js";

export async function renderUserPage(req, res, next) {
  const { userId } = req.params;
  const user = await uService.findUserDetails(userId);
  if (user) {
    return res.render('pages/userPage', { user });
  }
  else {
    return next(createError(404));
  }
}

export async function renderUserGallery(req, res) {
  const { userId: sUserId, role } = req.session.user; 
  const { userId } = req.params;

  let isPublic = true;
  if (sUserId === userId || [R.ADMIN, R.TEACHER].includes(role)) {
    isPublic = null;
  }

  const user = await uService.findUserDetails(userId);
  const workspaces = await wService.findWorkspaces(userId, null, isPublic);

  if (user) {
    return res.render('pages/userGallery', { user, workspaces });
  }
  else {
    return next(createError(404));
  }
}

export async function renderProjectPage(req, res) {
  const { userId: sUserId, role } = req.session.user; 
  const { userId, workspaceOid } = req.params;

  let isPublic = true;
  if (sUserId === userId || [R.ADMIN, R.TEACHER].includes(role)) {
    isPublic = null;
  }
  
  const user = await uService.findUserSemiDetails(userId);
  const workspaces = await wService.findWorkspaces(userId, 5, isPublic);
  const recentWorkspaces = await wService.findWorkspaces(null, 5, true);

  if (user) {
    return res.render('pages/projectPage', { user, workspaceOid, workspaces, recentWorkspaces });
  }
  else {
    return next(createError(404));
  }
}

export async function renderProjectInfoForm(req, res) {
  const { userId } = req.session.user;
  const { workspaceOid } = req.params;

  return res.render('pages/projectInfoForm', { workspaceOid });
}

export async function renderUserGroup(req, res) {
  const { userId } = req.params;
  const { groupOid } = req.query;

  let group = null;
  let groups = null;

  const user = await uService.findUserDetails(userId);

  if (groupOid) {
    group = await gService.findGroupWithAll(groupOid);
    for (const user of group.users) {
      user.missionProgress = {}
      for (const mission of group.missions) {
        user.missionProgress[mission._id] = await mService.findMissionProgressWithSubtask(user.userId, mission._id);
      }
      user.clearMpCount = Object.values(user.missionProgress).filter(e=>e.active&&e.clear).length;
    }
    group.users = group.users.sort((a,b)=>b.clearMpCount-a.clearMpCount);
  }
  else {
    const _user = await uService.findUserWithGroup(userId);
    groups = _user.groups;
  }

  if (user) {
    return res.render('pages/userGroup', { user, group, groups });
  }
  else {
    return next(createError(404));
  }
}

export async function renderUserMission(req, res) {
  const { userId } = req.params;
  const { missionOid } = req.query;

  let missionProgresses = []
  let missionProgress = null

  const user = await uService.findUserDetails(userId);

  if (missionOid) {
    missionProgress = await mService.findMissionProgressWithSubtask(userId, missionOid);
  }
  else {
    missionProgresses = await mService.findMissionProgressesWithMission(userId, true);
  }

  if (missionProgress || missionProgresses) {
    return res.render('pages/userMission', { user, missionProgress, missionProgresses });
  }
  else {
    return next(createError(404));
  }
}
