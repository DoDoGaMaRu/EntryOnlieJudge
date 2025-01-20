import { ROLE as R } from '#middlewares/session.middleware.js';
import { teachers } from '#middlewares/session.middleware.js';
import upService from '#services/uploads.service.js';

import uService from '#services/user.service.js';

export async function updateRole(req, res) {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    let newRole = R.USER;
    if (role === 'teacher') {
      teachers.add(userId);
      newRole = R.TEACHER;
    }
    if (role === 'user') {
      teachers.delete(userId);
      newRole = R.USER;
    }
    await uService.updateRole(userId, newRole);
    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}

export async function deleteDereferencedUploads(req, res) {
  try {
    const deleted = await upService.deleteDereferenced();
    const uploadsSize = await upService.getSize();

    return res.send({ deleted, uploadsSize });
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}