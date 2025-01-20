import createError from 'http-errors';

import {ROLE as R} from '#middlewares/session.middleware.js';

import gService from '#services/group.service.js';
import uService from '#services/user.service.js';
import mService from '#services/mission.service.js';


// GROUP
export async function renderGroupList(req, res) {
  const { query } = req.query;

  const groups = await gService.findGroups(query);
  return res.render('pagesTeacher/groupList', { groups });
}

export async function renderGroupForm(req, res) {
  return res.render('pagesTeacher/groupForm', { });
}

export async function renderGroupUserList(req, res) {
  const { groupOid } = req.params;
  const { query } = req.query;

  const group = await gService.findGroupWithUserInfo(groupOid);
  const member = group.users.map(e => String(e._id));

  const users = await uService.findUsers(query);
  const nonMember = users.filter(e => !member.includes(String(e._id)));

  return res.render('pagesTeacher/groupUserList', {group, nonMember});
}

export async function renderGroupMissionList(req, res) {
  const { groupOid } = req.params;
  const group = await gService.findGroupWithAll(groupOid);
  for (const user of group.users) {
    user.missionProgress = {}
    for (const mission of group.missions) {
      user.missionProgress[mission._id] = await mService.findMissionProgressWithSubtask(user.userId, mission._id);
    }
  }
  return res.render('pagesTeacher/groupMissionList', {group})
}

export async function renderGroupMissionForm(req, res) {
  const { groupOid } = req.params;
  const group = await groupRepo.findGroupWithUserInfo(groupOid);

  return res.render('pagesTeacher/groupMissionForm', {group})
}
// GROUP END



// USER
export async function renderUserList(req, res) {
  const { query } = req.query;
  const users = await uService.findUsers(query);
  return res.render('pagesTeacher/userList', { users });
}

export async function renderUserManagement(req, res) {
  const { userId } = req.params;
  const user = await uService.findUser(userId);
  const missionProgresses = await mService.findMissionProgressesWithMission(userId, true);

  return res.render('pagesTeacher/userManagement', {user, missionProgresses});
}

export async function renderUserMissionProgress(req, res) {
  const { userId, missionOid } = req.params;
  const user = await uService.findUser(userId);
  const missionProgress = await mService.findMissionProgressWithSubtask(userId, missionOid);

  return res.render('pagesTeacher/userMissionProgress', {user, missionProgress});
}
// USER END


// PRACTICE
export async function renderPracticeList(req, res) {
  return res.render('pagesTeacher/practiceList');
}

export async function renderPracticeForm(req, res) {

  const title = '새 실습 | 코더스아이티 루키';
  const practiceKey = null;
  return res.render('pagesTeacher/practiceForm', { title, practiceKey });
}

export async function renderPracticeModifyForm(req, res) {
  const { practiceKey } = req.params;
  const title = `${practiceKey}번 실습 수정 | 코더스아이티 루키`;
  return res.render('pagesTeacher/practiceForm', { title, practiceKey });
}

// PRACTICE END


// MISSION
export async function renderMissionList(req, res) {
  return res.render('pagesTeacher/missionList');
}

export async function renderMissionForm(req, res, next) {
  try {
    const {groupOid, userId} = req.query;
    
    if (!(groupOid || userId)) {
      return next(createError(404));
    }

    let groupName = null;
  
    if (groupOid) {
      const group = await gService.findGroup(groupOid);
      groupName = group.name;
    }
    
    return res.render('pagesTeacher/missionForm', { groupName });
  } catch (error) {
    return next(createError(404));
  }
}

export async function renderMissionManagement(req, res, next) {
  try {
    const { missionOid } = req.params;
    const mission = await mService.findMission(missionOid);
    return res.render('pagesTeacher/missionManagement', { mission });
  } catch (error) {
    return next(createError(500));
  }
}
// MISSION END