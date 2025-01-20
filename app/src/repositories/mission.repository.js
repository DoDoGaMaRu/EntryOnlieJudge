import BaseRepository from './base.repository.js';
import Mission, {MISSION_TYPE} from '#models/mission.js';

class MissionRepository extends BaseRepository {
  convertFilter(filter) {
    const {  } = filter;

    const newFilter = {};

    return newFilter;
  }

  // CREATE
  async create(missionData) {
    const mission = await Mission.create(missionData);
    return mission;
  }

  // READ
  async find(
    filter = {}, 
    projection = {}, 
    options = {},
    populates = {}
  ) {
    let exec = Mission.find(this.convertFilter(filter), projection);
    exec = this.applyPopulates(exec, populates);
    exec = this.applyOptions(exec, options);

    const missions = await exec;
    return missions;
  }

  async findById(
    objectId, 
    projection={},
    options={},
    populates={}
  ) {
    let exec = Mission.findById(objectId, projection);
    exec = this.applyPopulates(exec, populates);
    exec = this.applyOptions(exec, options);

    const mission = await exec;
    return mission;
  }


  async findOneBySubtask(
    subtask,
    projection = {}, 
    options = {},
    populates = {}
  ) {
    let exec = Mission.findOne(
      {subtasks: subtask._id}, 
      projection
    );
    exec = this.applyPopulates(exec, populates);
    exec = this.applyOptions(exec, options);

    const mission = await exec;
    return mission;
  }

  async count(
    filter={}, 
    options={}
  ) {
    let exec = Mission.countDocuments(this.convertFilter(filter));
    exec = this.applyOptions(exec, options);

    const count = await exec;
    return count;
  }

  // UPDATE
  async pushSubtask(mission, subtask) {
    await Mission.updateOne(
      {_id: mission._id},
      {$addToSet: {subtasks: subtask}}
    )
  }

  async pullSubtask(mission, subtask) {
    await Mission.updateOne(
      {_id: mission._id},
      {$pull: {subtasks: subtask._id}}
    )
  }

  // DELETE
  async deleteById(objectId) {
    await Mission.deleteOne({_id: objectId});
  }
}

export { MISSION_TYPE }
export default new MissionRepository();
