import express from 'express';

import Problem from '../../models/problem.js';
import Practice from '../../models/practice.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const e = {}
    return res.send("undefined" != typeof Symbol && null != e[Symbol.iterator] || null != e["@@iterator"])
});

router.get('/create/problem', async (req, res) => {
    // Mock Data
    try {
        const problem = new Problem({
            ownerId: 'test',
            title: 'test',
            level           : 1,
            description     : "its test",
            categories      : ['test1', 'test2'],
            queProjectJson  : {},
            ansProjectJson  : {},
            version         : 1,
        })
        problem.save();
        res.send('success');
    }
    catch (err) {
        console.log(err);
        res.status(400).send(err);
    }
});



router.get('/create/practice', async (req, res) => {
    // Mock Data
    try {
        const practice = new Practice({
            ownerId: 'test',
            title: 'test',
            description     : "its test",
            categories      : ['test1', 'test2'],
            projectJson     : {},
        })
        practice.save();
        res.send('success');
    }
    catch (err) {
        console.log(err);
        res.status(400).send(err);
    }
});

import AssetMetaLoader from '../../lib/AssetMetaLoader.js'
const aml = new AssetMetaLoader();

router.get('/readJson', (req, res) => {

    const main_category = 'people'
    const sub_category = 'all'
    const filtered = aml.get('sprite').filter(({ category }) => {
        const { main, sub } = category;
        return main_category === main && (sub_category === 'all' || sub_category === sub);
    });
    res.send(filtered);
})

router.get('/editor', (req, res) => {
    res.render('pages/index');
})


export default router;
