import BaseRepository from './base.repository.js';
import Subtask, { SUBTASK_TYPE } from '#models/subtask.js';


class SubtaskRepository extends BaseRepository {
  // CREATE
  async createProblem(subtaskData) {
    const subtask = await Subtask.extends[SUBTASK_TYPE.PROBLEM].create(subtaskData);
    return subtask;
  }

  async createPractice(subtaskData) {
    const subtask = await Subtask.extends[SUBTASK_TYPE.PRACTICE].create(subtaskData);
    return subtask;
  }

  // READ
  async findByProblemKey(
    problemKey, 
    projection = {}, 
    options = {},
    populates = {}
  ) {
    let exec = Subtask.extends[SUBTASK_TYPE.PROBLEM].find({key: problemKey}, projection);
    exec = this.applyPopulates(exec, populates);
    exec = this.applyOptions(exec, options);

    const subtasks = await exec;
    return subtasks;
  }

  async findByPractice(
    practiceKey, 
    projection = {}, 
    options = {},
    populates = {}
  ) {
    let exec = Subtask.extends[SUBTASK_TYPE.PRACTICE].find({key: practiceKey}, projection);
    exec = this.applyPopulates(exec, populates);
    exec = this.applyOptions(exec, options);

    const subtasks = await exec;
    return subtasks;
  }

  async findById(
    objectId, 
    projection={},
    options = {},
    populates={}
  ) {
    let exec = Subtask.findById(objectId, projection);
    exec = this.applyPopulates(exec, populates);
    exec = this.applyOptions(exec, options);

    const subtask = await exec;
    return subtask;
  }

  async count(
    filter={}, 
    options={}
  ) {
    let exec = Subtask.countDocuments({});
    exec = this.applyOptions(exec, options);

    const count = await exec;
    return count;
  }

  // UPDATE


  // DELETE
  async delete(subtask) {
    await Subtask.deleteOne({_id: subtask._id});
  }
}

export { SUBTASK_TYPE };
export default new SubtaskRepository();