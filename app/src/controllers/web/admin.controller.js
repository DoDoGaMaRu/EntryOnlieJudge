import { ROLE as R } from '#middlewares/session.middleware.js';
import uService from '#services/user.service.js';
import upService from '#services/uploads.service.js';


export async function renderTeacherList(req, res) {
  const { query } = req.query;
  const teachers = await uService.findUsers('', R.TEACHER);
  const users = await uService.findUsers(query, R.USER);

  return res.render('pagesAdmin/teacherList', {teachers, users})
}

export async function renderTextEditor(req, res) {
  return res.render('pagesAdmin/textEditor');
}

export async function renderDataManagement(req, res) {
  const uploadsSize = await upService.getSize();
  return res.render('pagesAdmin/dataManagement', {uploadsSize});
}
