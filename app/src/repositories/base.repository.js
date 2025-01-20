class BaseRepository {
  /**
   * 
   * @param {Object} exec 
   * @param {Object} options
   * @param {number} [options.skip]
   * @param {number} [options.limit]
   * @param {boolean} [options.lean]
   * @param {Object} [options.sort]
   * @returns {Object}
   */
  applyOptions(exec, options) {
    const {skip, limit, lean, sort} = options;
    if (skip) exec = exec.skip(skip);
    if (limit) exec = exec.limit(limit);
    if (sort) exec = exec.sort(sort);
    if (lean) exec = exec.lean();
    return exec;
  }

  /**
   * 
   * @param {Object} exec 
   * @param {Object} populates
   * @returns {Object}
   */
  applyPopulates(exec, populates) {
    for (const [field, projection] of Object.entries(populates)) {
      exec = exec.populate(field, projection);
    }
    return exec;
  }
}

export default BaseRepository;