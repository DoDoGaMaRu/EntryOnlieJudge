import _ from 'lodash';

import Problem from '../models/problem.js';

// API handlers
export async function getProblemByKey(req, res) {
    try {
        const { problemKey } = req.params;
        const prob = await Problem.findOne({key: problemKey}, {ansProjectJson: 0});
        const data = {}

        data.problem = prob;
        

        return res.send(data);
    } catch (error) {
        console.log(error);
        return res.status(400).send(error);
    }
}

export async function updateProblem(req, res) { // 문제 수정도 이 함수에서 수행 예정
    try {
        const {
            problemKey,
            title,
            level,
            description,
            categories,
            queProjectJson,
            ansProjectJson,
        } = req.body.problem;
        const { userId } = req.session.user;

        const prob = new Problem();

        prob.ownerId = userId;
        prob.title = title;
        prob.level = level;
        prob.description = description;
        prob.categories = categories;
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

    const problem = await Problem.findOne({key: problemKey}).lean();

    let ans = nomalization(problem.ansProjectJson);
    let dest = nomalization(project);
    let success = _.isEqual(ans,dest)
    console.log
    res.send({ans, dest, success});
}

function nomalization(project) {
    for (let obj of project.objects) {
        obj.script = JSON.parse(obj.script);
    }
    keyFilter(project, ['id', 'x', 'y', 'font', 'filename', 'fileurl'], true);
    return project;
}

function keyFilter(obj, filter, negative=false) {
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