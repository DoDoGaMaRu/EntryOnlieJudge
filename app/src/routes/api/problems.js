import express from 'express';
import multer from 'multer';

import accessModifier from '../../lib/accessModifier.js';
import * as cont from '../../controllers/problem.js';

const router = express.Router();
const storage = multer.memoryStorage();


router.get('/', );
router.get('/:problemKey', cont.getProblemByKey);
router.post('/', accessModifier(['admin']), cont.updateProblem);
router.post('/submit', accessModifier(['guest', 'user', 'admin']), cont.judge);

export default router;