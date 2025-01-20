import express from 'express';

import upload from '#middlewares/upload.middleware.js';
import { thumbMiddleware48 } from '#middlewares/thumb.middleware.js';

import { sessionSync, getAccessModifier, ROLE as R } from '#middlewares/session.middleware.js';
import * as cont from '#controllers/api/user.controller.js';


const router = express.Router();
router.use(sessionSync, getAccessModifier(R.USER));


router.post('/upload/profile', upload.images, thumbMiddleware48, cont.updateProfileImage);
router.post('/upload/background', upload.images, cont.updateBackgroundImage);

export default router;