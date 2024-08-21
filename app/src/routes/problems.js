import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.render('pages/problemList');
});
router.get('/ws/:problemKey', async (req, res) => {
  res.render('pages/problemPage', {title: 'problem solve test'})
});
router.get('/new', async (req, res) => {
  res.render('pages/problemForm', {title: 'new problem test'});
});

export default router;
