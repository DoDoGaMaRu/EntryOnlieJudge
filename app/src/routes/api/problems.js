import express from 'express';
import multer from 'multer';

import * as cont from '../../controllers/problem.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({storage});


router.get('/', );
router.get('/:pid', );
router.post('/', );
router.post('/submit/:pid', cont.judge);

export default router;