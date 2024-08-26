import express from 'express';

import accessModifier from '../lib/accessModifier.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.render('pages/problemList');
});

router.get('/ws/:problemKey', async (req, res) => {
  const { problemKey } = req.params;
  const title = 'problem solve test';
  res.render('pages/problemPage', { title, problemKey });
});

router.get('/new', accessModifier(['admin']), async (req, res) => {
  const title = '새 문제 작성';
  res.render('pages/problemForm', { title });
});

export default router;
