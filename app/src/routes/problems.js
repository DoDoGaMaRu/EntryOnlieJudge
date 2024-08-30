import express from 'express';
import accessModifier from '../lib/accessModifier.js';

const router = express.Router();

router.get('/', accessModifier(['guest', 'user', 'admin']), async (req, res) => {
		const title = '문제집';
    const { role } = req.session.user;
    return res.render('pages/problemList', { title, role });
});

router.get('/ws/:problemKey', accessModifier(['guest', 'user', 'admin']), async (req, res) => {
  const { problemKey } = req.params;
  const { role } = req.session.user;
  const title = `${problemKey}번 문제`;
  return res.render('pages/problemPage', { title, problemKey, role });
});

router.get('/new', accessModifier(['admin']), async (req, res) => {
  const title = '새 문제 작성';
  const problemKey = 'null';
  return res.render('pages/problemForm', { title, problemKey });
});

router.get('/modify/:problemKey', accessModifier(['admin']), async (req, res) => {
  const title = '문제 수정';
  const { problemKey } = req.params;
  return res.render('pages/problemForm', { title, problemKey });
});

export default router;
