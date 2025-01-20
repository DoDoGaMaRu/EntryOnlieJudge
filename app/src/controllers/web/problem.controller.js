import { ROLE as R } from '#middlewares/session.middleware.js';

import pService from '#services/problem.service.js';

export async function renderProblemList(req, res) {
  const { role } = req.session.user;

  const title = '문제집 | 코더스아이티 루키';
  return res.render('pages/problemList', { title });
}

export async function renderProblemPage(req, res){
  const { problemKey } = req.params;
  const { role } = req.session.user;

  const title = `${problemKey}번 문제 | 코더스아이티 루키`;
  return res.render('pages/problemPage', { title, problemKey });
}

export async function renderNewProblemForm(req, res) {
  const problemKey = 'null';

  const title = '새 문제 작성';
  return res.render('pages/problemForm', { title, problemKey });
}

export async function renderModifyProblemForm(req, res) {
  const { problemKey } = req.params;

  const title = '문제 수정';
  return res.render('pages/problemForm', { title, problemKey });
}