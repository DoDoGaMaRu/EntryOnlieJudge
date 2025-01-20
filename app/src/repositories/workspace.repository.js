import BaseRepository from './base.repository.js';
import Workspace from '#models/workspace.js';

class WorkspaceRepository extends BaseRepository {
  convertFilter(filter) {
    const { ownerId, query, _id, isPublic } = filter;
    
    const newFilter = {};
    if (ownerId) newFilter.ownerId = ownerId;
    if (query) newFilter.$or = [
      {title   : {$regex: `${query}`, $options: 'i'}},
      {ownerId : {$regex: `${query}`, $options: 'i'}}
    ];
    if (isPublic !== null && isPublic !== undefined) newFilter.isPublic = isPublic;
    if (_id) newFilter._id = _id;
    
    return newFilter;
  }

  // CREATE
  async create(workspaceData) {
    const workspace = await Workspace.create(workspaceData);
    return workspace;
  }

  // READ
  async find(
    filter = {}, 
    projection = {}, 
    options = {},
    populates = {}
  ) {
    let exec = Workspace.find(this.convertFilter(filter), projection);
    exec = this.applyPopulates(exec, populates);
    exec = this.applyOptions(exec, options);

    const workspaces = await exec;
    return workspaces;
  }

  async findById(
    objectId, 
    projection={},
    options = {},
    populates={}
  ) {
    let exec = Workspace.findById(objectId, projection);
    exec = this.applyPopulates(exec, populates);
    exec = this.applyOptions(exec, options);

    const workspace = await exec;
    return workspace;
  }

  async findOne(
    filter = {}, 
    projection = {}, 
    options = {},
    populates = {}
  ) {
    let exec = Workspace.findOne(this.convertFilter(filter), projection);
    exec = this.applyPopulates(exec, populates);
    exec = this.applyOptions(exec, options);

    const workspace = await exec;
    return workspace;
  }

  async count(
    filter={}, 
    options={}
  ) {
    let exec = Workspace.countDocuments(this.convertFilter(filter));
    exec = this.applyOptions(exec, options);

    const count = await exec;
    return count;
  }
  
  // UPDATE
  async update(workspace) {
    await workspace.save();
  }

  // DELETE
  async deleteById(objectId) {
    await Workspace.deleteOne({_id: objectId})
  }
}

export default new WorkspaceRepository();