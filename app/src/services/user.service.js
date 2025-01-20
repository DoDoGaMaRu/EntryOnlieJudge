import { ROLE as R } from "#middlewares/session.middleware.js";

import uRepo from "#repositories/user.repository.js";
import mRepo from "#repositories/mission.repository.js";
import pRepo from "#repositories/problem.repository.js";
import sRepo from "#repositories/solution.repository.js";
import lRepo from "#repositories/level.repository.js";

import mService, { SUBTASK_TYPE } from "./mission.service.js";


class UserService {
  /**
   * 새로운 user를 생성합니다. 새로운 유저의 로그인이 식별될 때(web.middleware) 주로 실행됩니다.
   * @param {String} userId 
   */
  async initUser(userId) {
    const userData = { userId };
    const user = await uRepo.findOneByUserId(userId);
    if (!user) {
      await uRepo.create(userData);
    }
  }

  /**
   * 
   * @param {string} userId 
   * @param {string} userName 
   */
  async updateUserName(userId, userName) {
    const user = await uRepo.findOneByUserId(userId);
    if (user) {
      user.userName = userName;
      await uRepo.update(user);
    }
  }

  /**
   * 각 유저는 성공한 문제 개수를 나타내는 clearCount 필드를 추가로 포함합니다.
   * @returns {Array(user)}
   */
  async findRanks() {
    const users = await uRepo.find(
      {role: R.USER}, 
      {userId: 1, score: 1, triedProblems: 1, profileThumbnail: 1},
      {sort: {score: -1}, lean: true}
    )
    for (const user of users) {
      user.clearCount = user.triedProblems.filter(tp => tp.clear).length;
      delete user.triedProblems;
    }
    return users;
  }

  /**
   * userId나 userName이 부분일치하는 user를 조회합니다.
   * @param {string} query - userId/userName 검색어
   * @param {number} role - 조회 대상의 ROLE 
   * @param {number} limit 
   * @returns {Array(user)} 조회된 user
   */
  async findUsers(query, role, limit=null) {
    const users = await uRepo.find(
      { query, role },
      {userId: 1, userName: 1, role: 1, profileImage: 1},
      {limit: limit, sort: {createdAt: -1}}
    );
    return users;
  }

  async countUsers(query, role) {
    const count = await uRepo.count({ query, role });
    return count;
  }

  async findUser(userId) {
    const user = await uRepo.findOneByUserId(userId);
    return user;
  }

  /**
   * group정보를 포함(populate)한 user의 정보를 조회합니다.
   * @param {string} userId 
   * @returns {user}
   */
  async findUserWithGroup(userId) {
    const user = await uRepo.findOneByUserId(userId, {}, {}, {groups: {}});
    return user;
  }
  
  /**
   * 미니 프로필에서 사용되는 user의 데이터를 조회합니다.
   * rank, percentile의 추가 데이터가 user에 포함됩니다. 
   * @param {string} userId 
   * @returns {user} user
   * @returns {number} user.rank
   * @returns {string} user.percentile
   */
  async findUserSemiDetails(userId) {
    const user = await uRepo.findOneByUserId(userId, {}, {lean: true});
    if (user) {
      // 랭킹 데이터
      const totalUser = await uRepo.count({role: R.USER});
      const countGt = await uRepo.countByGtScore(user.score, R.USER);
      user.rank = countGt + 1;
      user.percentile = `${(countGt/totalUser*100).toFixed(1)}`;
    }
    return user;
  }

  /**
   * 프로필에서 사용되는 user의 데이터를 조회합니다. 
   * rank, resentSolutions 등 추가 데이터가 user에 포함됩니다.
   * 상세사항은 returns를 참고합니다.
   * @param {string} userId 
   * @returns {user} user
   * @returns {number} user.rank
   * @returns {string} user.percentile
   * @returns {number} user.triedProblems[].level
   * @returns {Array<Object>} user.recentSolutions
   * @returns {String} user.recentSolutions[].title
   * @returns {number} user.recentSolutions[].level
   */
  async findUserDetails(userId) {
    const user = await uRepo.findOneByUserId(userId, {}, {lean: true});
    if (user) {
      // 랭킹 데이터
      const totalUser = await uRepo.count({role: R.USER});
      const countGt = await uRepo.countByGtScore(user.score, R.USER);
      user.rank = countGt + 1;
      user.percentile = `${(countGt/totalUser*100).toFixed(1)}`;

      // 시도한 문제
      const triedProblems = await pRepo.findByKeys(
        user.triedProblems.map(e=>e.problemKey),
        {_id: 0, key: 1, level: 1, title: 1}
      )
      const problemMap = triedProblems.reduce((acc, { key, level, title }) => ({...acc, [key]: { level, title }}), {});
      for (const tp of user.triedProblems) {
        tp.level = problemMap[tp.problemKey].level;
      }

      // 최근 푼 문제
      const recentSolutions = await sRepo.find(
        {ownerId: user.userId}, 
        {_id: 0, key: 1, problemKey: 1, clear: 1, createdAt: 1},
        {lean: true, limit: 30, sort: {createdAt: -1}}
      )
      for (const sol of recentSolutions) {
        sol.title = problemMap[sol.problemKey].title;
        sol.level = problemMap[sol.problemKey].level;
      }
      user.resentSolutions = recentSolutions;
    }
    return user;
  }

  /**
   * 
   * @param {string} userId 
   * @returns 
   */
  async countClearedProblem(userId) {
    const user = await uRepo.findOneByUserId(userId);
    const { triedProblems } = user;
    const count = triedProblems.filter(e=>e.clear).length;
    return count;
  }

  /**
   * 
   * @param {string} userId 
   * @param {ROLE} role 
   */
  async updateRole(userId, role) {
    const user = await uRepo.findOneByUserId(userId);
    if (user) {
      user.role = role;
      await uRepo.update(user);
    }
  }

  /**
   * 
   * @param {string} userId 
   * @param {string} imageUrl 
   * @param {string} thumbUrl 
   */
  async updateProfileImage(userId, imageUrl, thumbUrl) {
    const user = await uRepo.findOneByUserId(userId);
    if (user) {
      user.profileImage = imageUrl;
      user.profileThumbnail = thumbUrl;
      await uRepo.update(user);
    }
  }

  /**
   * 
   * @param {string} userId 
   * @param {string} imageUrl 
   */
  async updateBackgroundImage(userId, imageUrl) {
    const user = await uRepo.findOneByUserId(userId);
    if (user) {
      user.profileBackground = imageUrl;
      await uRepo.update(user);
    }
  }

  /**
   * 
   * @param {string} userId 
   * @param {string} missionOid 
   */
  async registerMission(userId, missionOid) {
    const user = await uRepo.findOneByUserId(userId);
    const mission = await mRepo.findById(missionOid);
    if (user && mission) {
      await mService.createMissionProgressMany(mission, [user]);
    }
  }

  /**
   * 
   * @param {string} userId 
   * @param {string} missionOid 
   */
  async unregisterMission(userId, missionOid) {
    const user = await uRepo.findOneByUserId(userId);
    const mission = await mRepo.findById(missionOid);
    if (user && mission) {
      await mService._deleteMissionProgressMany(mission, [user]);
    }
  }

  /**
   * 
   * @param {string} userId 
   * @param {string} problemKey 
   * @returns 
   */
  async isClearedProblem(userId, problemKey) {
    const cleared = await uRepo.getClearState(userId, problemKey);
    return cleared;
  }


  /**
   * 해당 유저의 점수를 다시 계산합니다.
   * @param {string} userId 
   * @returns 
   */
  async recalcScore(userId) {
    const user = await uRepo.findOneByUserId(userId);
    const levels = await lRepo.find();
    const scoreMap = levels.reduce((acc, {level, score})=>({...acc, [level]: score}), {});
    const { triedProblems } = user;
    const clearProblemKeys = triedProblems.filter(e=>e.clear).map(e=>e.problemKey);

    const problems = await pRepo.findByKeys(clearProblemKeys, {level: 1});
    user.score = 0;
    for (const {level} of problems) {
      user.score += scoreMap[`${level}`];
    }

    await uRepo.update(user);
  }
}

export default new UserService();