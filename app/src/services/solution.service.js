import _ from 'lodash';

import * as jsonUtils from '#utils/jsonUtils.js';
import sRepo from '#repositories/solution.repository.js';
import pRepo from '#repositories/problem.repository.js';
import uRepo from '#repositories/user.repository.js';
import lRepo from '#repositories/level.repository.js';
import { SUBTASK_TYPE } from '#repositories/subtask.repository.js';

import mService from '#services/mission.service.js';


// utils
const excludes = ['id', 'x', 'y', 'font', 'filename', 'thumbUrl', 'fileurl', 'interface', '_backupParams', 'dimension', 'selectedPictureId'];
const excludeObjNames = ['보기블록'];
const normalize = (project) => {
  project = JSON.parse(JSON.stringify(project));
  
  project.objects = project.objects.filter(obj => !excludeObjNames.some(name => obj.name.includes(name)));
	for (let obj of project.objects) {
		obj.script = JSON.parse(obj.script);
	}
	for (let fnc of project.functions) {
		fnc.content = JSON.parse(fnc.content);
	}

	jsonUtils.keyFilter(project, excludes, true);
	project = jsonUtils.typeNormalize(project, String);
	return project;
}


class SolutionService {
  /**
   * 솔루션 테이블의 생성에 필요한 데이터를 반환하는 함수입니다.
   * @param {String} userId - 조회, 수정 가능여부 판단용
   * @param {Number} page - 요청 페이지
   * @param {Number} maxPost - 한 페이지에 표시할 개수
   * @param {Number} maxPage - 페이지네이션에 표시할 개수
   * @param {Number} problemKey - 검색어(문제키 일치)
   * @param {String} query - 검색어(제목, 태그와 부분일치)
   * @returns 
   */
  async findSolutions(userId, page, maxPost, maxPage, problemKey, query) {
    const totalPost = await sRepo.count({ problemKey, query });
    const hidePost = page === 1 ? 0 : (page - 1) * maxPost;
		const totalPage = Math.ceil(totalPost / maxPost);
	
		let currentPage = page ? parseInt(page) : 1;
		if (currentPage > totalPage) currentPage = totalPage;
	
		const startPage = Math.floor(((currentPage - 1) / maxPage)) * maxPage + 1;
		let endPage = startPage + maxPage - 1;
		if (endPage > totalPage) endPage = totalPage;

    const solutions = await sRepo.find(
      { problemKey, query },
      {projectJson: 0},
      {skip: hidePost, limit: maxPost, sort: {key: -1}, lean: true},
    )
    
    if (userId) {
      const { triedProblems } = await uRepo.findOneByUserId(userId);
      if (triedProblems.length) {
        const clearMap = triedProblems.reduce((acc, {problemKey, clear}) => ({...acc, [problemKey]: clear}), {});
        for (const solution of solutions) {
          if (solution.ownerId === userId) {
            solution.editable = true;
          }
          if (clearMap[solution.problemKey] || solution.ownerId === userId) {
            solution.viewable = true;
          }
        }
      }
    }

    return { startPage, endPage, maxPost, totalPost, totalPage, currentPage, solutions };
  }

  async findSolutionByKey(solutionKey) {
    const solution = await sRepo.findOneByKey(solutionKey);
    return solution;
  }

  async findUserIdsByProblemKey(problemKey) {
    const solutions = await sRepo.find({ problemKey }, {ownerId: 1});
    const userIds = new Set(solutions.map(e=>e.ownerId));
    return userIds;
  }

  async judge(userId, problemKey, projectJson) {
    const problem = await pRepo.findOneByKey(problemKey);
    const level = await lRepo.findOneByLevel(problem.level);
    let clear = null;
    let ans = null;
    let dest = null;
    if (problem && level) {
      ans = normalize(problem.ansProjectJson);
      dest = normalize(projectJson);
      clear = _.isEqual(ans, dest);
      
      const solutionData = {
        ownerId: userId,
        problemKey: problemKey,
        projectJson: projectJson,
        clear: clear,
      }
      await sRepo.create(solutionData);

      const cleared = await uRepo.getClearState(userId, problemKey);
      // 사용자의 첫 번째 정답 이후에는 솔루션 제출이 정답률에 영향을 미치지 않습니다.
      if (!cleared) {
        await uRepo.pushTriedProblem(userId, problemKey, clear);
        clear && await uRepo.increaseScore(userId, level.score);
        clear && ++problem.correctorCount;
        clear && ++problem.correctCount;
        ++problem.solutionCount;
      }
      await pRepo.update(problem);

      if (clear) {
        const sps = await mService.findSubtaskStates(userId);
        for (const sp of sps) {
          if (
            sp.subtask.subtaskType === SUBTASK_TYPE.PROBLEM && 
            sp.subtask.key === parseInt(problemKey)
          ) {
            await mService.updateSubtaskState(userId, sp._id, clear);
          }
        }
      }
    }
    return {clear, ans, dest};
  }
}


export default new SolutionService();