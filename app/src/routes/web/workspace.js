import express from 'express';

import { getAccessModifier, ROLE as R } from '#middlewares/session.middleware.js';
import * as cont from '#controllers/web/workspace.controller.js'

const router = express.Router();
router.use(getAccessModifier(R.USER));

router.get('/new', cont.renderWorkspace);
router.get('/:workspaceOid', cont.renderWorkspace);

export default router;