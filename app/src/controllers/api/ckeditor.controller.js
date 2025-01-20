export async function uploadImage(_req, res) {
  try {
    const image = _req.files[0];
    res.send({url: `/rookie/${image.path}`});
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
}