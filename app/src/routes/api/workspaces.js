import express from 'express';
import multer from 'multer';

import accessModifier from '../../lib/accessModifier.js'
import * as cont from '../../controllers/workspace.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({storage});

router.get('/solution/:problemKey', accessModifier(['guest', 'admin', 'user']), cont.getSolutionWorkspace);
router.post('/solution', accessModifier(['admin', 'user']), cont.saveSolutionWorkspace);
router.post('/ent', accessModifier(['admin']), upload.single('file'), cont.entUpload);

export default router;