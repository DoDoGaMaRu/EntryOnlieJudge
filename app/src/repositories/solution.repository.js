import BaseRepository from './base.repository.js';
import Solution from '#models/solution.js';

class SolutionRepository extends BaseRepository {
  convertFilter(filter) {
    const {ownerId, problemKey, query, clear} = filter;
    
    const newFilter = {};
    if (ownerId) newFilter.ownerId = ownerId;
    if (clear !== undefined) newFilter.clear = clear;
    if (problemKey) newFilter.problemKey = problemKey;
    if (query) newFilter.ownerId = {$regex: `${query}`, $options: 'i'};

    return newFilter;
  }

  // CREATE
  async create(solutionData) {
    const solution = await Solution.create(solutionData);
    return solution;
  }

  // READ
  async find(
    filter = {}, 
    projection = {}, 
    options = {},
    populates = {}
  ) {
    let exec = Solution.find(this.convertFilter(filter), projection);
    exec = this.applyPopulates(exec, populates);
    exec = this.applyOptions(exec, options);

    const solutions = await exec;
    return solutions;
  }

  async findById(
    objectId, 
    projection={},
    options = {},
    populates={}
  ) {
    let exec = Solution.findById(objectId, projection);
    exec = this.applyOptions(exec, options);
    exec = this.applyPopulates(exec, populates);

    const solution = await exec;
    return solution;
  }

  async findOneByKey(
    key,
    projection={},
    options = {},
    populates={}
  ) {
    let exec = Solution.findOne({ key }, projection);
    exec = this.applyOptions(exec, options);
    exec = this.applyPopulates(exec, populates);

    const solution = await exec;
    return solution;
  }

  async count(
    filter={}, 
    options={}
  ) {
    let exec = Solution.countDocuments(this.convertFilter(filter));
    exec = this.applyOptions(exec, options);

    const count = await exec;
    return count;
  }

  // UPDATE


  // DELETE
  async deleteMany(
    filter={}
  ) {
    await Solution.deleteMany(this.convertFilter(filter));
  }
}

export default new SolutionRepository();