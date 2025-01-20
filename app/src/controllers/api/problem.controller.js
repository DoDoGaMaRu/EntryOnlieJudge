import pService from "#services/problem.service.js";

import { ROLE as R } from "#middlewares/session.middleware.js";
import mService from "#services/mission.service.js";

export async function getProblems(req, res) {
  try {
    const { userId, role } = req.session.user;
    const { page, level, query } = req.query;
    const maxPost = 15;
    const maxPage = 10;
    const onlyPublic = role<R.TEACHER? true:null;

    const {
      startPage, endPage, totalPost, totalPage, currentPage, problems
    } = await pService.findProblems(userId, page, maxPost, maxPage, query, level, onlyPublic)
    
		const meta = { startPage, endPage, maxPost, totalPost, totalPage, currentPage }
		return res.status(200).send({ meta, problems })
  } catch (error) {
		console.log(error)
		return res.status(500).send(error);
  }
}

export async function getProblem(req, res) {
  try {
		const { userId, role } = req.session.user;
		const { problemKey } = req.params;

    const { problem, clear } = await pService.findProblemByKey(userId, problemKey);
    if (
      !problem.isPublic &&
      role < R.TEACHER && 
      !await mService.isMissionProblem(userId, problemKey)
    ) {
      return res.sendStatus(403);
    }
    return res.send({ problem, clear });

  } catch (error) {
		console.log(error);
		return res.status(500).send(error);
  }
}

export async function deleteProblem(req, res) {
  try {
		const { problemKey } = req.params;

    await pService.deleteProblem(problemKey);

		return res.sendStatus(200);
  } catch (error) {
		console.log(error);
		return res.status(500).send(error);
  }
}

export async function upsertProblem(req, res) {
  try {
		const { problem } = req.body;
		const { problemKey } = problem;
		const { userId } = req.session.user;
    const { title, level, description, tags, queProjectJson, ansProjectJson, isPublic } = problem;

    const problemData = {
      ownerId: userId,
      title: title, 
      level: level, 
      description: description, 
      tags: tags, 
      queProjectJson: queProjectJson, 
      ansProjectJson: ansProjectJson,
      isPublic: isPublic,
    }

    if (problemKey) {
      await pService.updateProblem(problemKey, problemData);
    }
    else {
      await pService.createProblem(problemData);
    }

    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}

export async function getTempProject(req, res) {
  try {
		const { problemKey } = req.params;
		const { userId } = req.session.user;

    const workspace = await pService.findTempProject(userId, problemKey);
    return res.send({ workspace }) 
  } catch (error) {
		console.log(error);
		return res.status(500).send(error);
  }
}

export async function upsertTempProject(req, res) {
	try {
		const { problemKey } = req.params;
		const { projectJson } = req.body;
		const { userId } = req.session.user;

    await pService.upsertTempProject(userId, problemKey, projectJson);
    return res.sendStatus(200);
	} catch (error) {
		console.log(error);
		return res.status(500).send(error);
	}
}