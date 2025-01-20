import BaseRepository from './base.repository.js';
import TempProject, {TEMP_PROIJECT_TYPE} from '#models/tempProject.js';

class TempProjectRepository extends BaseRepository {
  convertFilter(filter) {
    const { ownerId, key, projectType } = filter;
    
    const newFilter = {};
    if (projectType) newFilter.projectType = projectType;
    if (ownerId) newFilter.ownerId = ownerId;
    if (key) newFilter.key = key;

    return newFilter;
  }

  // READ
  async find(
    filter = {}, 
    projection = {}, 
    options = {},
    populates = {}
  ) {
    let exec = TempProject.find(this.convertFilter(filter), projection);
    exec = this.applyPopulates(exec, populates);
    exec = this.applyOptions(exec, options);

    const tempProjects = await exec;
    return tempProjects;
  }

  async findById(
    objectId, 
    projection={},
    options = {},
    populates={}
  ) {
    let exec = TempProject.findById(objectId, projection);
    exec = this.applyPopulates(exec, populates);
    exec = this.applyOptions(exec, options);

    const tempProject = await exec;
    return tempProject;
  }

  async findOne(
    filter = {}, 
    projection = {}, 
    options = {},
    populates = {}
  ) {
    let exec = TempProject.findOne(this.convertFilter(filter), projection);
    exec = this.applyPopulates(exec, populates);
    exec = this.applyOptions(exec, options);

    const tempProject = await exec;
    return tempProject;
  }

  async count(
    filter={}, 
    options={}
  ) {
    let exec = TempProject.countDocuments(this.convertFilter(filter));
    exec = this.applyOptions(exec, options);

    const count = await exec;
    return count;
  }
  
  // UPDATE
  async upsert(ownerId, key, projectType, projectJson) {
    await TempProject.updateOne(
      { ownerId, key, projectType },
      { $set: { projectJson } },
      { upsert: true }
    )
  }

  // DELETE
}

export { TEMP_PROIJECT_TYPE };
export default new TempProjectRepository();