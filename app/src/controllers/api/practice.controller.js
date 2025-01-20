import pService from "#services/practice.service.js";
import { ROLE as R } from "#middlewares/session.middleware.js";

export async function getPractices(req, res) {
  try {
    const { page, ownerId, query } = req.query;
    const maxPost = 15;
    const maxPage = 10;

    const {
      startPage, endPage, totalPost, totalPage, currentPage, practices
    } = await pService.findPractices(page, maxPost, maxPage, ownerId, query);
    
		const meta = { startPage, endPage, maxPost, totalPost, totalPage, currentPage }
		return res.send({ meta, practices })
  } catch (error) {
		console.log(error)
		return res.status(500).send(error);
  }
}

export async function getPractice(req, res) {
  try {
		const { practiceKey } = req.params;
    
    const practice = await pService.findPracticeByKey(practiceKey);
    
    return res.send({ practice });
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}

export async function deletePractice(req, res) {
  try {
		const { practiceKey } = req.params;

    await pService.deletePractice(practiceKey);

    return res.sendStatus(200);
	}
	catch (error) {
		return res.status(200).send(error);
  }
}

export async function upsertPractice(req, res) {
  try {
    const { practice } = req.body;
    const { practiceKey } = practice;
    const { userId } = req.session.user;
    const { title, outline, description, tags, projectJson } = practice;

    const practiceData = {
      ownerId: userId,
      title: title,
      outline: outline,
      description: description,
      tags: tags,
      projectJson: projectJson
    };

    if (practiceKey) {
      await pService.updatePractice(practiceKey, practiceData);
    }
    else {
      await pService.createPractice(practiceData);
    }

    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}


export async function getTempProject(req, res) {
	try {
    const { userId } = req.session.user;
		const { practiceKey } = req.params;
    const workspace = await pService.findTempProject(userId, practiceKey);
		return res.send({ workspace });
	} catch (error) {
		console.log(error);
		return res.status(500).send(error);
	}
}

export async function getOtherTempProject(req, res) {
	try {
    const { practiceKey, userId } = req.params;
    
    const workspace = await pService.findTempProject(userId, practiceKey);
		return res.send({ workspace });
} catch (error) {
  console.log(error);
  return res.status(500).send(error);
}
}

export async function upsertTempProject(req, res) {
	try {
		const { practiceKey } = req.params;
		const { projectJson } = req.body;
		const { userId } = req.session.user;

    await pService.upsertTempProject(userId, practiceKey, projectJson);
		return res.sendStatus(200);
	} catch (error) {
		console.log(error);
		return res.status(500).send(error);
	}
}

