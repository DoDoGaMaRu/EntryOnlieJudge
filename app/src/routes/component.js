import express from 'express';
const router = express.Router();

router.get('/textEditor', (req, res) => {
    res.render('organisms/textEditor');
});

router.get('/workspace', (req, res) => {
    res.render('organisms/workspace');
});

export default router;
