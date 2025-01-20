import gRepo from "#repositories/group.repository.js";
import uRepo from "#repositories/user.repository.js";
import mRepo from "#repositories/mission.repository.js";

import mService from './mission.service.js';

class GroupService {
  /**
   * 새 그룹을 추가합니다. users나 missions필드는 채우지 말아주세요.
   * @param {Object} groupData 
   * @param {String} groupData.name
   * @param {String} groupData.description 
   * @param {String} groupData.backgroundImage 
   * @returns 
   */
  async createGroup(groupData) {
    const group = await gRepo.create(groupData);
    return group;
  }

  /**
   * 그룹을 삭제합니다. 그룹 mission과 mission을 참조하는 missionProgress가 모두 삭제됩니다.
   * @param {String} groupOid 
   */
  async deleteGroup(groupOid) {
    const group = await gRepo.findById(groupOid);

    if (group) {
      await uRepo.pullGroupMany(group.users, group);
      for (let mission of group.missions) {
        await mService.deleteMission(mission._id);
      }
      await gRepo.deleteById(groupOid);
    }
  }

  /**
   * 검색어와 name이 부분 일치하는 그룹들을 검색합니다
   * @param {String} query - 검색어
   * @returns 
   */
  async findGroups(query) {
    const groups = await gRepo.find({ query });
    return groups;
  }

  async findGroup(groupOid) {
    const group = await gRepo.findById(groupOid);
    return group;
  }

  async findGroupWithUserInfo(groupOid) {
    const group = await gRepo.findById(groupOid, {}, {}, {users: {userId: 1, userName: 1}});
    return group;
  }

  async findGroupWithAll(groupOid) {
    const group = await gRepo.findById(groupOid, {}, {lean: true}, {missions: {}, users: {}});
    return group;
  }

  /**
   * 그룹에 유저를 추가합니다. 
   * 그룹의 mission을 참조하는 missionProgress도 비활성화 상태로 일괄 추가됩니다.
   * @param {String} userId 
   * @param {String} groupOid 
   */
  async registerUserAtGroup(userId, groupOid) {
    const group = await gRepo.findById(groupOid, {}, {}, {missions: {}});
    const user = await uRepo.findOneByUserId(userId);
    
    if (group && user) {
      await gRepo.pushUser(group, user);
      await uRepo.pushGroup(user, group);
      for (let mission of group.missions) {
        await mService._createMissionProgressMany(mission, [user]);
      }
    }
  }
  
  /**
   * 그룹에서 유저를 삭제합니다. 
   * 그룹의 mission을 참조하는 missionProgress도 같이 삭제됩니다. 
   * @param {String} userId
   * @param {String} groupOid 
   */
  async unregisterUserAtGroup(userId, groupOid) {
    const group = await gRepo.findById(groupOid);
    const user = await uRepo.findOneByUserId(userId);

    if (group && user) {
      await gRepo.pullUser(group, user);
      await uRepo.pullGroup(user, group);
      for (let mission of group.missions) {
        await mService._deleteMissionProgressMany(mission, [user]);
      }
    }
  }

  /**
   * 미션을 그룹에 추가합니다. 
   * 이 미션을 참조하는 missionProgress가 그룹의 모든 유저에게 비활성화 상태로 추가됩니다.
   * @param {String} missionOid 
   * @param {String} groupOid 
   */
  async registerMissionAtGroup(missionOid, groupOid) {
    const group = await gRepo.findById(groupOid);
    const mission = await mRepo.findById(missionOid);

    if (group && mission) {
      await gRepo.pushMission(group, mission);
      await mService._createMissionProgressMany(mission, group.users);
    }
  }

  /**
   * 미션을 그룹에서 삭제합니다. 
   * 이 미션을 참조하는 missionProgress도 같이 삭제됩니다.
   * @param {String} missionOid 
   * @param {String} groupOid 
   */
  async unregisterMissionAtGroup(missionOid, groupOid) {
    const group = await gRepo.findById(groupOid);
    const mission = await mRepo.findById(missionOid);

    if (group && mission) {
      await gRepo.pullMission(group, mission);
      await mService._deleteMissionProgressMany(mission, group.users);
    }
  }

  /**
   * 이 미션이 등록된 모든 그룹에서 미션을 삭제합니다. 
   * 이 미션을 참조하는 missionProgress도 같이 삭제됩니다.
   * @param {String} missionOid 
   */
  async unregisterMission(missionOid) {
    const mission = await mRepo.findById(missionOid);

    if (mission) {
      const groups = await gRepo.find({mission: missionOid});
      for (const group of groups) {
        await gRepo.pullMission(group, mission);
        await mService._deleteMissionProgressMany(mission, group.users);
      }
    }
  }
}

export default new GroupService();