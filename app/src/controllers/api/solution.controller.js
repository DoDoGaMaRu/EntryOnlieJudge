import _ from 'lodash';

import { ROLE as R } from '#middlewares/session.middleware.js';

import sService from '#services/solution.service.js';
import uService from '#services/user.service.js';

export async function getSolutions(req, res) {
	try {
    const { problemKey, query, page } = req.query;
		const { userId, role } = req.session.user;
		const maxPost = 20;
		const maxPage = 10;

    const {
      startPage, endPage, totalPost, totalPage, currentPage, solutions
    } = await sService.findSolutions(userId, page, maxPost, maxPage, problemKey, query);

		if ([R.ADMIN, R.TEACHER].includes(role)) {
			for (const solution of solutions) {
				solution.viewable = true;
			}
		}

		const meta = { startPage, endPage, maxPost, totalPost, totalPage, currentPage };
		return res.status(200).send({ meta, solutions });
  } catch (error) {
		console.log(error);
		return res.status(500).send(error);
  }
}

export async function getSolution(req, res) {
	try {
		const { solutionKey } = req.params;
		const { role, userId } = req.session.user;
		const solution = await sService.findSolutionByKey(solutionKey);

		if ([R.ADMIN, R.TEACHER].includes(role)) {
			return res.send({ solution });
		}
		else if ([R.USER].includes(role)) {
			const cleared = await uService.isClearedProblem(userId, solution.problemKey);
			if (cleared || solution.ownerId === userId) {
				return res.send({ solution });
			}
		}
		else {
			return res.sendStatus(403);
		}
	} catch (error) {
		console.log(error);
		return res.status(500).send(error);
	}
}

export async function judge(req, res) {
	try {
		const { problemKey, projectJson } = req.body;
		const { userId, role } = req.session.user;

    const {clear, ans, dest} = await sService.judge(userId, problemKey, projectJson);
		const data = {clear};
		if ([R.ADMIN].includes(role)) {
			data.ans = ans;
			data.dest = dest;
		}
		return res.send(data);
  } catch (error) {
		console.log(error);
		return res.status(500).send(error);	
	}
}
