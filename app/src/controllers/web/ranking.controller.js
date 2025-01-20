import uService from "#services/user.service.js";

export async function renderRanking(req, res) {
  let users = await uService.findRanks()
  return res.render('pages/ranking', { users });
}
