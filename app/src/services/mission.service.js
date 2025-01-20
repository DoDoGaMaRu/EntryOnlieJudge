import mRepo, { MISSION_TYPE } from '#repositories/mission.repository.js';
import sRepo, { SUBTASK_TYPE } from '#repositories/subtask.repository.js';
import mpRepo from '#repositories/missionProgress.repository.js';
import uRepo from '#repositories/user.repository.js';


class missionService {
  /**
   * 새로운 미션을 생성합니다.
   * @param {Object} missionData 
   * @param {String} missionData.title 
   * @param {Array(String)} missionData.tag
   * @param {String} missionData.description 
   * @param {Boolean} isGroup - 생략가능(생략시 false)
   * @returns 
   */
  async createMission(missionData, isGroup=false) {
    missionData.missionType = isGroup? MISSION_TYPE.GROUP:MISSION_TYPE.PERSONAL;
    const mission = await mRepo.create(missionData);
    return mission;
  }

  async findMission(missionOid) {
    const mission = await mRepo.findById(missionOid, {}, {}, {subtasks: {}});
    return mission;
  }

  async deleteMission(missionOid) {
    const mission = await mRepo.findById(missionOid);
    if (mission) {
      for (const subtask of mission.subtasks) {
        await sRepo.delete(subtask);
      }
      await mRepo.deleteById(mission._id);
      await mpRepo.deleteMany({mission})
    }
  }

  /**
   * 새로운 서브태스크를 생성합니다. 
   * mission을 참조하는 모든 missionProgress에도 추가됩니다.
   * @param {string} missionOid 
   * @param {SUBTASK_TYPE} subtaskType
   * @param {string} title 
   * @param {number} key 
   */
  async createSubtask(missionOid, subtaskType, title, key) {
    const mission = await mRepo.findById(missionOid, {}, {}, {subtasks: {}});
    if (mission) {
      for (const subtask of mission.subtasks) {
        if (subtask.subtaskType === subtaskType && subtask.key === key) {
          throw new Error('Subtask duplicated');
        }
      }
      const subtask = 
        subtaskType === SUBTASK_TYPE.PROBLEM   ? await sRepo.createProblem({ title, key }) :
        subtaskType === SUBTASK_TYPE.PRACTICE  ? await sRepo.createPractice({ title, key }) : null;

      if (subtask) {
        await mRepo.pushSubtask(mission, subtask);
        await mpRepo.pushSubtaskManyByMission(mission, subtask);
        await this._updateMissionProgressMany(mission);
      }
    }
  }

  /**
   * 기존 서브태스크를 삭제합니다. 
   * mission을 참조하는 모든 missionProgress에서도 삭제됩니다.
   * @param {string} subtaskOid 
   */
  async deleteSubtask(subtaskOid) {
    const subtask = await sRepo.findById(subtaskOid);
    if (subtask) {
      const mission = await mRepo.findOneBySubtask(subtask);
      await this._updateMissionProgressMany(mission);
      
      if (mission) {
        await mpRepo.pullSubtaskManyByMission(mission, subtask);
        await mRepo.pullSubtask(mission, subtask);
        await sRepo.delete(subtask);
        await this._updateMissionProgressMany(mission);
      }
    }
  }

  async createMissionProgress(missionOid, userOids, active=false) {
    const mission = await mRepo.findById(missionOid);
    if (mission) {
      await this._createMissionProgressMany(mission, userOids, active);
    }
  }
  
  async findMissionProgressesWithUser(missionOid) {
    const missionProgresses = await mpRepo.find({mission: missionOid}, {}, {}, {user: {}});
    return missionProgresses;
  }

  async findMissionProgressesWithMission(userId, active=null) {
    const user = await uRepo.findOneByUserId(userId);
    if (user) {
      const missionProgresses = await mpRepo.find({user, active}, {}, {sort: {activedAt: -1}}, {mission: {}});
      return missionProgresses;
    }
  }

  /**
   * 
   * @param {String} userId 
   * @param {String} missionOid 
   * @returns 
   */
  async findMissionProgressWithSubtask(userId, missionOid) {
    const user = await uRepo.findOneByUserId(userId);
    const mission = await mRepo.findById(missionOid);
    if (user && mission) {
      const mp = await mpRepo.findOne({ mission, user }, {}, {}, {'subtasks.subtask': {}, mission: {}});
      return mp; 
    }
  }

  /**
   * missionProgress.subtask의 클리어 상태를 변경합니다. 
   * missionProgress의 클리어 상태도 같이 변경됩니다.
   * @param {String} userId 
   * @param {String} subtaskStateOid 
   * @param {Boolean} clear 
   */
  async updateSubtaskState(userId, subtaskStateOid, clear) {
    const user = await uRepo.findOneByUserId(userId);
    const mp = await mpRepo.findOneBySubtaskStates(user, subtaskStateOid);
    
    for (const subtaskState of mp.subtasks) {
      if (subtaskState._id.toString() === subtaskStateOid.toString()) {
        subtaskState.clear = clear;
      }
    }
    const allClear = !mp.subtasks.some((e)=>(e.clear===false));
    mp.clear = allClear;
    await mpRepo.update(mp);
  }

  /**
   * missionProgress의 활성화 상태를 변경합니다.
   * @param {String} userId 
   * @param {String} missionOid 
   * @param {Boolean} active 
   */
  async activeMissionProgress(userId, missionOid, active) {
    const user = await uRepo.findOneByUserId(userId);
    const mission = await mRepo.findById(missionOid);
    if (user && mission) {
      const mp = await mpRepo.findOne({user, mission});
      mp.activedAt = new Date();
      mp.active = active;
      await mpRepo.update(mp);
    }
  }

  /**
   * 해당 유저의 모든 subtask를 가져옵니다.
   * @param {String} userId 
   * @param {Boolean} active - 활성화된 미션만 가져옵니다. 
   * @returns 
   */
  async findSubtaskStates(userId, active=null) {
    const user = await uRepo.findOneByUserId(userId)
    let subtaskStates = [];
    if (user) {
      const missionProgresses = await mpRepo.find({user, active}, {subtasks: 1}, {}, {'subtasks.subtask': {}});
      for (const mp of missionProgresses) {
        subtaskStates = subtaskStates.concat(mp.subtasks);
      }
    }
    return subtaskStates;
  }

  /**
   * 미션으로 등록된 문제인지 확인합니다.
   * @param {String} userId 
   * @param {String} problemKey 
   * @returns 
   */
  async isMissionProblem(userId, problemKey) {
    let subtaskStates = await this.findSubtaskStates(userId, true);
    for (const ss of subtaskStates) {
      if (
        ss.subtask.subtaskType == SUBTASK_TYPE.PROBLEM && 
        ss.subtask.key == problemKey
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * missionProgress를 생성합니다.
   * @param {Mission} mission 
   * @param {Array(User)} users 
   * @param {Boolean} active - 생략 가능(생략시 false)
   */
  async _createMissionProgressMany(mission, users, active=false) {
    const subtasks = mission.subtasks.map((e) => {
      return {subtask: e._id}
    });
    for (let user of users) {
      await mpRepo.create({
        user: user,
        mission: mission, 
        subtasks: subtasks,
        active: active,
      });
    }
    await this._updateMissionProgressMany(mission, users);
  }

  /**
   * missionProgress를 삭제합니다.
   * @param {Mission} mission 
   * @param {Array(User)} users 
   */
  async _deleteMissionProgressMany(mission, users) {
    await mpRepo.deleteMany({mission, users});
  }

  /**
   * 해당 미션에 대한 진행도를 일괄 업데이트 합니다.
   * 새로운 missionProgress의 생성이나, subtask의 생성시 호출이 필요합니다.
   * @param {mission} mission 
   * @param {Array[user]} users 
   */
  async _updateMissionProgressMany(mission, users=null) {
    const mps = await mpRepo.find(
      { mission, users }, {}, {},
      {'subtasks.subtask': {}, user: {userId: 1}}
    )
    for (const mp of mps) {
      for (const ss of mp.subtasks) {
        if (ss.subtask.subtaskType === SUBTASK_TYPE.PROBLEM && !ss.clear) {
          const clearState = await uRepo.getClearState(mp.user.userId, ss.subtask.key);
          ss.clear = clearState === true;
        }
      }
      mp.clear = !mp.subtasks.some((e)=>(e.clear===false));

      await mpRepo.update(mp);
    }
  }
}

export { SUBTASK_TYPE }
export default new missionService();