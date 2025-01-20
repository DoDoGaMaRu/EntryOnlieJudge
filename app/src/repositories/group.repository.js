import BaseRepository from './base.repository.js';
import Group from '#models/group.js';

class GroupRepository extends BaseRepository {
  convertFilter(filter) {
    const {query, mission} = filter;
    
    const newFilter = {};
    if (query) newFilter.name = {$regex: `${query}`, $options: 'i'};
    if (mission) newFilter.missions = mission;

    return newFilter;
  }

  // CREATE
  async create(groupData) {
    const group = await Group.create(groupData);
    return group;
  }

  // READ
  async find(
    filter = {}, 
    projection = {}, 
    options = {},
    populates = {}
  ) {
    let exec = Group.find(this.convertFilter(filter), projection);
    exec = this.applyPopulates(exec, populates);
    exec = this.applyOptions(exec, options);

    const groups = await exec;
    return groups;
  }

  async findById(
    objectId, 
    projection={},
    options={},
    populates={}
  ) {
    let exec = Group.findById(objectId, projection);
    exec = this.applyPopulates(exec, populates);
    exec = this.applyOptions(exec, options);

    const group = await exec;
    return group;
  }

  async count(
    filter={}, 
    options={}
  ) {
    let exec = Group.countDocuments(this.convertFilter(filter));
    exec = this.applyOptions(exec, options);

    const count = await exec;
    return count;
  }

  // UPDATE
  async pushUser(group, user) {
    await Group.updateOne(
      {_id: group._id},
      {$addToSet: {users: user._id}}
    )
  }

  async pullUser(group, user) {
    await Group.updateOne(
      {_id: group._id},
      {$pull: {users: user._id}}
    )
  }
  
  async pushMission(group, mission) {
    await Group.updateOne(
      {_id: group._id},
      {$addToSet: {missions: mission._id}}
    )
  }

  async pullMission(group, mission) {
    await Group.updateOne(
      {_id: group._id},
      {$pull: {missions: mission._id}}
    )
  }
  
  // DELETE
  async deleteById(objectId) {
    await Group.deleteOne({_id: objectId});
  }
}

export default new GroupRepository();