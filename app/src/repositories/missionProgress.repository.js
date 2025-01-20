import BaseRepository from './base.repository.js';
import MissionProgress from '#models/missionProgress.js';

class MissionRepository extends BaseRepository {
  convertFilter(filter) {
    const { mission, users, user, active } = filter;

    const newFilter = {};
    if (mission) newFilter.mission = mission;
    if (users) newFilter.user = {$in: users};
    if (user) newFilter.user = user;
    if (active!==undefined && active!==null) newFilter.active = active;
    return newFilter;
  }

  // CREATE
  async create(missionProgressData) {
    const missionProgress = await MissionProgress.create(missionProgressData);
    return missionProgress;
  }

  // READ
  async find(
    filter = {}, 
    projection = {}, 
    options = {},
    populates = {}
  ) {
    let exec = MissionProgress.find(this.convertFilter(filter), projection);
    exec = this.applyPopulates(exec, populates);
    exec = this.applyOptions(exec, options);

    const missionProgresses = await exec;
    return missionProgresses;
  }

  async findById(
    objectId, 
    projection={},
    options={},
    populates={}
  ) {
    let exec = MissionProgress.findById(objectId, projection);
    exec = this.applyPopulates(exec, populates);
    exec = this.applyOptions(exec, options);

    const missionProgress = await exec;
    return missionProgress;
  }


  async findOne(
    filter = {}, 
    projection={},
    options={},
    populates={}
  ) {
    let exec = MissionProgress.findOne(this.convertFilter(filter), projection);
    exec = this.applyPopulates(exec, populates);
    exec = this.applyOptions(exec, options);

    const missionProgress = await exec;
    return missionProgress;
  }

  async findOneBySubtaskStates(
    user,
    objectId,
    projection={},
    options={},
    populates={}
  ) {
    let exec = MissionProgress.findOne({user: user, 'subtasks._id': objectId}, projection);
    exec = this.applyPopulates(exec, populates);
    exec = this.applyOptions(exec, options);

    const missionProgress = await exec;
    return missionProgress;
  }

  async count(
    filter={}, 
    options={}
  ) {
    const { mission } = filter;
    
    const dbQuery = {};
    if (mission) dbQuery.mission = mission;

    let exec = MissionProgress.countDocuments(this.convertFilter(filter));
    exec = this.applyOptions(exec, options);

    const count = await exec;
    return count;
  }

  // UPDATE
  async pushSubtaskManyByMission(mission, subtask) {
    await MissionProgress.updateMany(
      {mission: mission._id},
      {$addToSet: {subtasks: {subtask: subtask}}, clear: false}
    )
  }

  async pullSubtaskManyByMission(mission, subtask) {
    await MissionProgress.updateMany(
      {mission: mission._id},
      {$pull: {subtasks: {subtask: subtask}}}
    )
  }

  async update(missionProgress) {
    await missionProgress.save();
  }

  // DELETE
  async deleteMany(
    filter = {}
  ) {
    await MissionProgress.deleteMany(this.convertFilter(filter));
  }
}

export default new MissionRepository();