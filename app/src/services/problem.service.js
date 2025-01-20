import pRepo from '#repositories/problem.repository.js'
import uRepo from '#repositories/user.repository.js';
import sRepo from '#repositories/solution.repository.js';
import stRepo from '#repositories/subtask.repository.js';
import tpRepo, { TEMP_PROIJECT_TYPE } from '#repositories/tempProject.repository.js';
import mService from './mission.service.js';
import uService from './user.service.js';
import sService from './solution.service.js';

class ProblemService {
  /**
   * 문제 테이블의 생성에 필요한 데이터를 반환하는 함수입니다.
   * 반환되는 problems의 각 problem은 각 문제의 성공상태(problem.clear)를 포함하고 있습니다.
   * @param {string} userId - 풀이 시도 상태 확인용
   * @param {number} page - 요청 페이지
   * @param {number} maxPost - 한 페이지에 표시할 개수
   * @param {number} maxPage - 페이지네이션에 표시할 개수
   * @param {string} query - 검색어(제목, 태그와 부분일치)
   * @param {number} level - 문제의 레벨
   * @param {boolean} isPublic - 공개된 문제만 가져오기
   * @returns 
   */
  async findProblems(userId, page, maxPost, maxPage, query, level, isPublic=null) {
    const totalPost = await pRepo.count({query, level, isPublic});
		const hidePost = page === 1 ? 0 : (page - 1) * maxPost;
		const totalPage = Math.ceil(totalPost / maxPost);
	
		let currentPage = page ? parseInt(page) : 1;  
		if (currentPage > totalPage) currentPage = totalPage;
	
		const startPage = Math.floor(((currentPage - 1) / maxPage)) * maxPage + 1;
		let endPage = startPage + maxPage - 1;
		if (endPage > totalPage) endPage = totalPage;
    
    const problems = await pRepo.find(
      {query, level, isPublic},
      {key: 1, title: 1, level: 1, tags: 1, solutionCount: 1, correctCount: 1, correctorCount: 1, isPublic: 1},
      {skip: hidePost, limit: maxPost, lean: true, sort: {key: -1}}
    )

    const user = await uRepo.findOneByUserId(userId);
    if (user) {
      const { triedProblems } = user;
      const problemStates = triedProblems.reduce((acc, { problemKey, clear }) => ({...acc, [problemKey]: clear}), {});
      for (let problem of problems) {
        problem.clear = problemStates[problem.key];
      }  
    }

    return {startPage, endPage, maxPost, totalPost, totalPage, currentPage, problems}
  }

  /**
   * 단일 문제를 조회하는 함수입니다.
   * @param {string} userId 
   * @param {string} key 
   * @returns 
   */
  async findProblemByKey(userId, key) {
    const problem = await pRepo.findOneByKey(key);
    let clear = null;
    if (problem) {
      clear = await uRepo.getClearState(userId, key);
    }
    return {problem, clear};
  }

  /**
   * 문제를 생성합니다
   * @param {string} problemData.ownerId 
   * @param {string} problemData.title 
   * @param {number} problemData.level 
   * @param {string} problemData.description 
   * @param {array}  problemData.tags 
   * @param {Map} problemData.queProjectJson 
   * @param {Map} problemData.ansProjectJson 
   */
  async createProblem(problemData) {
    const problem = await pRepo.create(problemData);
    return problem;
  }

  /**
   * 문제를 업데이트합니다. 해당 문제를 푼 사람들의 점수가 다시 계산됩니다.
   * @param {number} key 
   * @param {string} problemData.title 
   * @param {number} problemData.level 
   * @param {string} problemData.description 
   * @param {array}  problemData.tags 
   * @param {Object} problemData.queProjectJson 
   * @param {Object} problemData.ansProjectJson 
   */
  async updateProblem(key, problemData) {
    delete problemData.ownerId;
    let problem = await pRepo.findOneByKey(key);
    
    if (problem) {
      problem.set(problemData);
      await pRepo.update(problem);
      const userIds = await sService.findUserIdsByProblemKey(key);
      for (const userId of userIds) {
        await uService.recalcScore(userId);
      }
    }
  }

  /**
   * 문제를 삭제합니다. 관련 서브태스크와 솔루션이 삭제되며,
   * 해당 문제를 푼 사람들의 점수가 다시 계산됩니다.
   * @param {string} key
   */
  async deleteProblem(key) {
    const problem = await pRepo.findOneByKey(key);
    if (problem) {
      const userIds = await sService.findUserIdsByProblemKey(key);
      await pRepo.deleteById(problem._id);
      await sRepo.deleteMany({problemKey: key});

      const subtasks = await stRepo.findByProblemKey(key);
      for (const subtask of subtasks) {
        await mService.deleteSubtask(subtask._id);
      }
      await uRepo.pullTriedProblemMany(key);
      for (const userId of userIds) {
        await uService.recalcScore(userId);
      }
    }
  }

  /**
   * 문제의 답안에 대한 임시 프로젝트를 불러옵니다
   * @param {string} userId
   * @param {string} key
   * @returns 
   */
  async findTempProject(userId, key) {
    const tempProject = await tpRepo.findOne({
      ownerId: userId,
      key: key,
      projectType: TEMP_PROIJECT_TYPE.PROBLEM
    })
    return tempProject;
  }

  /**
   * 문제의 답안에 대한 임시 프로젝트를 저장합니다
   * @param {string} userId 
   * @param {string} key 
   * @param {Map} projectJson 
   */
  async upsertTempProject(userId, key, projectJson) {
    await tpRepo.upsert(userId, key, TEMP_PROIJECT_TYPE.PROBLEM, projectJson);
  }
}

export default new ProblemService();