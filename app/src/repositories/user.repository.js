import BaseRepository from './base.repository.js';
import User from '#models/user.js';

class UserRepository extends BaseRepository {
  convertFilter(filter) {
    const { query, role } = filter;
    
    const newFilter = {};
    if (query) newFilter.$or = [
      {userId   : {$regex: `${query}`, $options: 'i'}},
      {userName : {$regex: `${query}`, $options: 'i'}}
    ];
    if (role) newFilter.role = role;

    return newFilter;
  }

  /**
   * CREATE
   * 새로운 유저 생성 - 최초 접속시 사용합니다.
   * @param {Object} userData 
   * @param {String} userData.userId
   * @param {String} userData.userName 
   * @returns 
   */
  async create(userData) {
    const user = await User.create(userData);
    return user;
  }

  // READ
  async find(
    filter = {}, 
    projection = {}, 
    options = {},
    populates = {}
  ) {
    let exec = User.find(this.convertFilter(filter), projection);
    exec = this.applyPopulates(exec, populates);
    exec = this.applyOptions(exec, options);

    const users = await exec;
    return users;
  }

  async findOneByUserId(
    userId,
    projection = {}, 
    options = {},
    populates = {}
  ) {
    let exec = User.findOne({ userId }, projection);
    exec = this.applyPopulates(exec, populates);
    exec = this.applyOptions(exec, options);

    const user = await exec;
    return user;
  }

  async findById(
    objectId, 
    projection={},
    options = {},
    populates={}
  ) {
    let exec = User.findById(objectId, projection);
    exec = this.applyPopulates(exec, populates);
    exec = this.applyOptions(exec, options);

    const user = await exec;
    return user;
  }

  async count(
    filter={}, 
    options={}
  ) {
    let exec = User.countDocuments(this.convertFilter(filter));
    exec = this.applyOptions(exec, options);

    const count = await exec;
    return count;
  }

  async countByGtScore(score, role) {
    const count = await User.countDocuments({ score: { $gt: score }, role: role });
    return count;
  }

  /**
   * 
   * @param {*} userId 
   * @param {*} problemKey 
   * @returns boolean - 시도 이력이 없는 경우 null반환
   */
  async getClearState(userId, problemKey) {
    let status = null;
    const tried = await User.countDocuments({
      userId: userId,
      'triedProblems': {$elemMatch: { problemKey: problemKey }},
    });
    if (tried) {
      status = 0 < await User.countDocuments({
        userId: userId,
        'triedProblems': {$elemMatch: { problemKey: problemKey, clear: true }},
      });
    }
    return status;
  }

  // UPDATE
  async update(user) {
    await user.save();
  }

  async pushGroup(user, group) {
    await User.updateOne(
      {_id: user._id},
      {$addToSet: {groups: group._id}}
    )
  }

  async pullGroup(user, group) {
    await User.updateOne(
      {_id: user._id},
      {$pull: {groups: group._id}}
    )
  }

  async pullGroupMany(userOids, group) {
    await User.updateMany(
      {_id: {$in: userOids}},
      {$pull: {groups: group._id}}
    )
  }
  
  /**
   * UPDATE - 이미 triedProblem이 존재한다면 업데이트합니다.
   * @param {string} userId 
   * @param {number} problemKey 
   * @param {boolean} clear 
   */
  async pushTriedProblem(userId, problemKey, clear) {
    await User.updateOne(
      { userId: userId, 'triedProblems.problemKey': problemKey},
      { $set: { 'triedProblems.$.clear': clear } }
    )
    await User.updateOne(
      { userId: userId, 'triedProblems.problemKey': {$ne: problemKey} },
      { $push: { triedProblems: { problemKey, clear } } },
    );
  }

  async pullTriedProblemMany(problemKey) {
    await User.updateMany(
      { 'triedProblems.problemKey': problemKey },
      { $pull: { triedProblems: { problemKey } } },
    );
  }

  async increaseScore(userId, score) {
    await User.updateOne(
      { userId },
      { $inc: { score } }
    )
  }
  // DELETE
}

export default new UserRepository();