import BaseRepository from './base.repository.js';
import Practice from '#models/practice.js';

class PracticeRepository extends BaseRepository {
  convertFilter(filter) {
    const { ownerId, query } = filter;

    const newFilter = {};
    if (ownerId) newFilter.ownerId = {$regex: `${ownerId}`, $options: 'i'}
    if (query) newFilter.$or = [
      {title: {$regex: `${query}`, $options: 'i'}},
			{tags: {$elemMatch: {$regex: `${query}`, $options: 'i'}}},
    ];

    return newFilter;
  }

  // CREATE
  async create(practiceData) {
    const practice = await Practice.create(practiceData);
    return practice;
  }

  // READ
  async find(
    filter = {}, 
    projection = {}, 
    options = {},
    populates = {}
  ) {
    let exec = Practice.find(this.convertFilter(filter), projection);
    exec = this.applyPopulates(exec, populates);
    exec = this.applyOptions(exec, options);

    const practices = await exec;
    return practices;
  }

  async findById(
    objectId, 
    projection={},
    options = {},
    populates={}
  ) {
    let exec = Practice.findById(objectId, projection);
    exec = this.applyPopulates(exec, populates);
    exec = this.applyOptions(exec, options);

    const practice = await exec;
    return practice;
  }

  async findOneByKey(
    key,
    projection = {}, 
    options = {},
    populates = {}
  ) {
    let exec = Practice.findOne({ key }, projection);
    exec = this.applyPopulates(exec, populates);
    exec = this.applyOptions(exec, options);

    const practice = await exec;
    return practice;
  }


  async count(
    filter={}, 
    options={}
  ) {
    let exec = Practice.countDocuments(this.convertFilter(filter));
    exec = this.applyOptions(exec, options);

    const count = await exec;
    return count;
  }

  // UPDATE
  async update(practice) {
    await practice.save();
  }

  // DELETE
  async delete(practice) {
    await Practice.deleteOne({_id: practice._id});
  }
}

export default new PracticeRepository();