import uService from "#services/user.service.js";

export async function updateProfileImage(_req, res) {
  try {
    const { userId } = _req.session.user;
    const file = _req.files[0];

    await uService.updateProfileImage(userId, file.path, file.thumbPath);

    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}

export async function updateBackgroundImage(_req, res) {
  try {
    const { userId } = _req.session.user;
    const file = _req.files[0];
    
    await uService.updateBackgroundImage(userId, file.path);

    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}