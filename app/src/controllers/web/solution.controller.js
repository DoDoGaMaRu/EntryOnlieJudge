import { ROLE as R } from '#middlewares/session.middleware.js';

export async function renderSolutionList(req, res) {
  const { problemKey } = req.query;
  const { role } = req.session.user;
  let title = `채점현황 | 코더스아이티 루키`
  if (problemKey) {
    title = `${problemKey}번 문제 제출 | 코더스아이티 루키`;
  }
  return res.render('pages/solutionList', { title, problemKey });
}

export async function renderSolutionPage(req, res) {
  const { solutionKey } = req.params;
  
  const title = `${solutionKey}번 제출 | 코더스아이티 루키`;
  
  return res.render('pages/solutionPage', { title, solutionKey });
}