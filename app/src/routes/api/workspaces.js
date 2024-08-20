import express from 'express';
import multer from 'multer';

import * as cont from '../../controllers/workspace.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({storage});


router.post('/', upload.single('file'), cont.entUpload);

export default router;