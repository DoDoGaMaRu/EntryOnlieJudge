import express from 'express';
import accessModifier from '../lib/accessModifier.js';

const router = express.Router();

router.get('/', accessModifier(['guest', 'user', 'admin']), async (req, res) => {
	const title = '연습 리스트';
	return res.render('pages/practiceList', { title });
});

router.get('/ws/:practiceKey', accessModifier(['user', 'admin']), async (req, res) => {
	const { practiceKey } = req.params;
	const { role } = req.session.user;
	const title = ``;
	return res.render('pages/practicePage', { title, practiceKey, role });
});

router.get('/new', accessModifier(['admin']), async (req, res) => {
	const title = '새 교안 작성';
	const practiceKey = 'null';
	return res.render('pages/practiceForm', { title, practiceKey });
});

router.get('/modify/:practiceKey', accessModifier(['admin']), async (req, res) => {
	const title = '교안 수정';
	const { practiceKey } = req.params;
	return res.render('pages/practiceForm', { title, practiceKey });
});

export default router;