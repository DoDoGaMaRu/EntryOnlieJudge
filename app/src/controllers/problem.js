import Problem from '../models/problem.js';

// API handlers
export async function getByKey(req, res) {
    try {
        const { pid } = req.params;
        const prob = await Problem.findOne({key: pid}, {ansProjectJson: 0});
        return res.send({problem: prob});
    } catch (error) {
        console.log(error);
        return res.status(400).send(error);
    }
}

export async function update(req, res) { // 문제 수정도 이 함수에서 수행 예정
    try {
        const {
            problemKey,
            userId, // TODO 추후에 세션 적용하고 미들웨어로 가져올 예정 
            title,
            level,
            description,
            categories,
            queProjectJson,
            ansProjectJson,
        } = req.body.problem;
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


export function judge(req, res) {
    console.log(req.body);
    res.send(req.body);
}
