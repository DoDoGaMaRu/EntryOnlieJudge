import BaseRepository from './base.repository.js';
import Problem from '#models/problem.js';

class ProblemRepository extends BaseRepository {
  convertFilter(filter) {
    const { query, level, isPublic } = filter;
    
    const newFilter = {};
    if (query) newFilter.$or = [
			{title: {$regex: `${query}`, $options: 'i'}},
			{tags: {$elemMatch: {$regex: `${query}`, $options: 'i'}}},
		];
		if (level) newFilter.level = level;
    if (isPublic !== null && isPublic !== undefined) newFilter.isPublic = isPublic; 

    return newFilter;
  }

  // CREATE
  async create(problemData) {
    const problem = await Problem.create(problemData);
    return problem;
  }

  // READ
  async find(
    filter = {}, 
    projection = {}, 
    options = {},
    populates = {}
  ) {
    let exec = Problem.find(this.convertFilter(filter), projection);
    exec = this.applyPopulates(exec, populates);
    exec = this.applyOptions(exec, options);

    const problems = await exec;
    return problems;
  }

  async findById(
    objectId, 
    projection={},
    options={},
    populates={}
  ) {
    let exec = Problem.findById(objectId, projection);
    exec = this.applyPopulates(exec, populates);
    exec = this.applyOptions(exec, options);

    const problem = await exec;
    return problem;
  }
  
  async findOneByKey(
    key,
    projection={},
    options={},
    populates={}
  ) {
    let exec = Problem.findOne({ key }, projection);
    exec = this.applyPopulates(exec, populates);
    exec = this.applyOptions(exec, options);
    
    const problem = await exec;
    return problem;
  }

  async findByKeys(
    keys,
    projection={},
    options={},
    populates={}
  ) {
    let exec = Problem.find({key: {$in: keys}}, projection);
    exec = this.applyPopulates(exec, populates);
    exec = this.applyOptions(exec, options);
    
    const problems = await exec;
    return problems;
  }

  async count(
    filter={}, 
    options={}
  ) {
    let exec = Problem.countDocuments(this.convertFilter(filter));
    exec = this.applyOptions(exec, options);

    const count = await exec;
    return count;
  }

  // UPDATE
  async update(problem) {
    await problem.save();
  }

  // DELETE
  async deleteById(objectId) {
    await Problem.deleteOne({_id: objectId});
  }
}

export default new ProblemRepository();