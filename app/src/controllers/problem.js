import _ from 'lodash';

import Problem from '../models/problem.js';
import Solution from '../models/solution.js';


// API handlers
export async function getProblems(req, res) {
	const maxPost = 15;
	const maxPage = 10;
	try {
		const { page, query } = req.query;
		const { userId, role } = req.session.user;

		const dbQuery = {};
		if (dbQuery) {
			dbQuery.$or = [
				{title: {$regex: `${query}`, $options: 'i'}},
				{tags: {$elemMatch: {$regex: `${query}`, $options: 'i'}}},
			]
		}
		const totalPost = await Problem.countDocuments(dbQuery);
		let currentPage = page ? parseInt(page) : 1;
		const hidePost = page === 1 ? 0 : (page - 1) * maxPost;
		const totalPage = Math.ceil(totalPost / maxPost);
		
		if (currentPage > totalPage) {
			currentPage = totalPage;
		}
	
		const startPage = Math.floor(((currentPage - 1) / maxPage)) * maxPage + 1;
		let endPage = startPage + maxPage - 1;
	
		if (endPage > totalPage) {
			endPage = totalPage;
		}

		const filter = {key: 1, title: 1, level: 1, tags: 1};
		const filteredProbs = await Problem.find(dbQuery, filter).sort({ key: -1 }).skip(hidePost).limit(maxPost);
		const problems = []
		for (let prob of filteredProbs) {
			prob = prob.toJSON();
			prob.clear = false;
			if (role !== 'guest') {
				prob.clear = 0 < await Solution.countDocuments({key: prob.key, ownerId: userId, clear: true});
			}
			problems.push(prob);
		}

		const meta = { startPage, endPage, maxPost, totalPost, totalPage, currentPage }
		return res.status(200).send({ meta, problems })
	} catch (error) {
		return res.status(400).send(error);
	}
}


export async function getProblemByKey(req, res) {
	try {
		const { problemKey } = req.params;
		const { userId } = req.session.user;

		const filter = {};
		if (req.session.user.role !== 'admin') {
			filter['ansProjectJson'] = 0;
		}
		const prob = await Problem.findOne({ key: problemKey }, filter);
		let clear = false
		if (userId !== 'guest') {
			clear = 0 < await Solution.countDocuments({ key: problemKey, ownerId: userId, clear: true });
		}
		const data = {}

		data.problem = prob;
		data.clear = clear;
		
		return res.send(data);
	} catch (error) {
		console.log(error);
		return res.status(400).send(error);
	}
}

export async function deleteProblem(req, res) {
	try {
		const { problemKey } = req.params;
		await Problem.deleteOne({ key: problemKey });
		return res.sendStatus(200);
	}
	catch (error) {
		return res.status(200).send(error);
	}
}

export async function updateProblem(req, res) {
	try {
		const {
			problemKey,
			title,
			level,
			description,
			tags,
			queProjectJson,
			ansProjectJson,
		} = req.body.problem;
		const { userId } = req.session.user;

		const prob = problemKey === null ? new Problem() : await Problem.findOne({ key: problemKey });

		prob.ownerId = userId;
		prob.title = title;
		prob.level = level;
		prob.description = description;
		prob.tags = tags;
		prob.queProjectJson = queProjectJson;
		prob.ansProjectJson = ansProjectJson;

		await prob.save();

		return res.sendStatus(200);
	} catch (error) {
		console.log(error);
		return res.status(400).send(error);
	}
}


export async function judge(req, res) {
	const { problemKey, project } = req.body;
	const { userId, role } = req.session.user;

	try {
		const problem = await Problem.findOne({ key: problemKey }).lean();

		const ans = normalize(problem.ansProjectJson);
		const dest = normalize(project);

		const clear = _.isEqual(ans, dest);

		if (role !== 'guest') {
			const solution = new Solution();
			solution.ownerId = userId;
			solution.key = problemKey;
			solution.projectJson = project;
			solution.clear = clear;

			await solution.save();
		}

		res.send({ ans, dest, clear });
	} catch (error) {
		console.log(error);
		return res.status(400).send(error);	
	}
}

function normalize(project) {
	for (let obj of project.objects) {
		obj.script = JSON.parse(obj.script);
	}
	keyFilter(project, ['id', 'x', 'y', 'font', 'filename', 'thumbUrl', 'fileurl', 'interface'], true);
	project = typeNormalize(project);
	return project;
}

function keyFilter(obj, filter, negative = false) {
	if (typeof obj !== 'object' || obj === null) {
		return;
	}

	if (Array.isArray(obj)) {
		for (let item of obj) {
			keyFilter(item, filter, negative);
		}
	} else {
		for (let key in obj) {
			if (!filter.includes(key) ^ negative) {
				delete obj[key];
			} else {
				keyFilter(obj[key], filter, negative);
			}
		}
	}
}

function typeNormalize(obj) {
	if (Array.isArray(obj)) {
		return obj.map(typeNormalize);
	}
	else if (obj !== null && typeof obj === 'object') {
		return Object.keys(obj).reduce((result, key) => {
			result[key] = typeNormalize(obj[key]);
			return result;
		}, {});
	}
	return String(obj);
}