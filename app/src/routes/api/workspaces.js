import express from 'express';

import { sessionSync, getAccessModifier, ROLE as R } from '#middlewares/session.middleware.js';
import upload from '#middlewares/upload.middleware.js';
import * as cont from '#controllers/api/workspace.controller.js';


const router = express.Router();
router.use(sessionSync, getAccessModifier(R.USER));


router.post('/', upload.base64ImageWs, cont.upsertWorkspace);
router.put('/info', cont.updateWorkspaceInfo);
router.get('/:workspaceOid', cont.getWorkspace);
router.delete('/:workspaceOid', cont.deleteWorkspace);
router.put('/:workspaceOid/public', cont.updatePublic);

export default router;