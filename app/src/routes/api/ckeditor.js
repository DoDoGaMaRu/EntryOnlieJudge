import express from 'express';

import { sessionSync, getAccessModifier, ROLE as R } from '#middlewares/session.middleware.js';
import upload from '#middlewares/upload.middleware.js';
import * as cont from '#controllers/api/ckeditor.controller.js';

const router = express.Router();
router.use(sessionSync, getAccessModifier(R.TEACHER));

router.post('/upload', upload.ckImages, cont.uploadImage);

export default router;