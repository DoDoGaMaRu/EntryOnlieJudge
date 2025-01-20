import gService from '#services/group.service.js';
import mService, { SUBTASK_TYPE } from '#services/mission.service.js';
import uService from '#services/user.service.js';

// USER
export async function updateUserInfo(req, res) {
  try {
    const { userData } = req.body;
    const { userId, userName } = userData;

    if (userName) {
      await uService.updateUserName(userId, userName);      
    }
    
    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}

// GROUP
export async function insertGroup(req, res) {
  try {
    const {name, description, backgroundImage} = req.body.group;

    const groupData = {name, description, backgroundImage}
    await gService.createGroup(groupData);

    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
}

export async function registerUserAtGroup(req, res) {
  try {
    const { groupOid, userId } = req.body;
    await gService.registerUserAtGroup(userId, groupOid);

    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
}

export async function unregisterUserAtGroup(req, res) {
  try {
    const { groupOid, userId } = req.body;
    await gService.unregisterUserAtGroup(userId, groupOid);

    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
}

export async function deleteGroup(req, res) {
  try {
    const { groupOid } = req.body;
    await gService.deleteGroup(groupOid);

    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
}
// GROUP END


// MISSION 
export async function insertMission(req, res) {
  try {
    const { title, tag, description, subtasks, groupOid, userId } = req.body;
    
    const missionData = { title, tag, description };
    const mission = await mService.createMission(missionData, !userId);
    for (const { type, key, title } of subtasks) {
      const subtaskType = 
        type === 'problem'  ? SUBTASK_TYPE.PROBLEM:
        type === 'practice' ? SUBTASK_TYPE.PRACTICE: null;
      await mService.createSubtask(mission._id, subtaskType, title, key);
    }

    if (userId) {
      const user = await uService.findUser(userId);
      await mService.createMissionProgress(mission._id, [user._id], true);
    }
    if (groupOid) {
      const group = await gService.findGroup(groupOid);
      await gService.registerMissionAtGroup(mission._id, group._id);
    }

    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
}

export async function deleteMission(req, res) {
  try {
    const {missionOid} = req.params;
    
    await gService.unregisterMission(missionOid);
    await mService.deleteMission(missionOid);
    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
}

export async function insertSubtask(req, res) {
  try {
    const { missionOid, type, key, title } = req.body;
    const subtaskType = 
      type === 'problem'  ? SUBTASK_TYPE.PROBLEM:
      type === 'practice' ? SUBTASK_TYPE.PRACTICE: null;

    await mService.createSubtask(missionOid, subtaskType, title, key);

    return res.sendStatus(200);
  } catch (error) {
    return res.status(400).send(error.message);
  }
}

export async function deleteSubtask(req, res) {
  try {
    const { subtaskOid } = req.params;
    await mService.deleteSubtask(subtaskOid);
    
    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
}

export async function updateMissionProgress(req, res) {
  const { subtaskStateOid } = req.params;
  const { userId, clear } = req.body;

  try {
    await mService.updateSubtaskState(userId, subtaskStateOid, clear);

    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
}

export async function activeMissionProgress(req, res) {
  try {
    const { userId, missionOid, active } = req.body;
    await mService.activeMissionProgress(userId, missionOid, active);

    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
}
// MISSION END