import pRepo from '#repositories/practice.repository.js';
import sRepo from '#repositories/subtask.repository.js';
import tpRepo, { TEMP_PROIJECT_TYPE } from '#repositories/tempProject.repository.js';
import mService from './mission.service.js';

class PracticeService {
  /**
   * @param {Object} practiceData
   * @param {string} practiceData.ownerId 
   * @param {string} practiceData.title 
   * @param {string} practiceData.description 
   * @param {Array} practiceData.tags 
   * @param {Object} practiceData.projectJson 
   */
  async createPractice(practiceData) {
    await pRepo.create(practiceData);
  }

  /**
   * 실습 테이블의 생성에 필요한 데이터를 반환하는 함수입니다.
   * @param {Number} page - 요청 페이지
   * @param {Number} maxPost - 한 페이지에 표시할 개수
   * @param {Number} maxPage - 페이지네이션에 표시할 개수
   * @param {String} ownerId - 검색어(ownerId와 부분일치)
   * @param {String} query - 검색어(제목, 태그와 부분일치)
   * @returns 
   */
  async findPractices(page, maxPost, maxPage, ownerId, query) {
    const totalPost = await pRepo.count({ ownerId, query });
		const hidePost = page === 1 ? 0 : (page-1)*maxPost;
		const totalPage = Math.ceil(totalPost / maxPost);

		let currentPage = page ?? 1;  
		if (currentPage > totalPage) currentPage = totalPage;

		const startPage = Math.floor(((currentPage - 1) / maxPage)) * maxPage + 1;
		let endPage = startPage + maxPage - 1;
		if (endPage > totalPage) endPage = totalPage;

    const practices = await pRepo.find(
      {ownerId, query},
      {key: 1, ownerId: 1, title: 1, outline: 1, tags: 1},
      {skip: hidePost, limit: maxPost, sort: {key: -1}}
    )
    return {startPage, endPage, maxPost, totalPost, totalPage, currentPage, practices };
  }

  async findPracticeByKey(key) {
    const practice = await pRepo.findOneByKey(key);
    return practice;
  }

  /**
   * 
   * @param {number} key 
   * @param {Object} practiceData
   * @param {string} practiceData.title
   * @param {string} practiceData.description
   * @param {Array} practiceData.tags 
   * @param {Object} practiceData.projectJson 
   */
  async updatePractice(key, practiceData) {
    delete practiceData.ownerId;
    let practice = await pRepo.findOneByKey(key);
    
    if (practice) {
      practice.set(practiceData);
      await pRepo.update(practice);
    }
  }

  async findTempProject(userId, key) {
    const tempProject = await tpRepo.findOne({
      ownerId: userId,
      key: key,
      projectType: TEMP_PROIJECT_TYPE.PRACTICE
    });
    return tempProject;
  }

  async upsertTempProject(userId, key, projectJson) {
    await tpRepo.upsert(userId, key, TEMP_PROIJECT_TYPE.PRACTICE, projectJson);
  }

  async deletePractice(key) {
    const practice = await pRepo.findOneByKey(key);
    if (practice) {
      await pRepo.delete(practice);

      const subtasks = await sRepo.findByPractice(key);
      for (const subtask of subtasks) {
        await mService.deleteSubtask(subtask._id);
      }
    }
  }
}

export default new PracticeService();