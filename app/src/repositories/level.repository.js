import BaseRepository from './base.repository.js';
import Level from '#models/level.js';

class LevelRepository extends BaseRepository {
  // READ
  async find(
    filter={},
    projection={},
  ) {
    const levels = Level.find({}, projection);
    return levels;
  }

  async findOneByLevel(
    level,
    projection={},
  ) {
    const _level = Level.findOne({ level }, projection);
    return _level;
  }

  async count() {
    let exec = Level.countDocuments();
    exec = this.applyOptions(exec, options);

    const count = await exec;
    return count;
  }

  // UPDATE
  
  // DELETE
}

export default new LevelRepository();