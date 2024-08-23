import express from 'express';
const router = express.Router();

router.get('/documentViewer', (req, res) => {
    res.render('components/documentViewer');
});

router.get('/documentEditor', (req, res) => {
    res.render('components/documentEditor');
});

router.get('/workspace', (req, res) => {
    res.render('components/entryWorkspace');
});

export default router;
