import { ROLE as R } from '#middlewares/session.middleware.js';

export async function renderPracticePage(req, res) {
	const { practiceKey } = req.params;
	const { userId } = req.query;

	const title = `${practiceKey}번 실습 | 코더스아이티 루키`;
  const saveable = !userId;
	return res.render('pages/practicePage', { title, practiceKey, saveable });
}
