import express from 'express';

import * as cont from '#controllers/web/component.controller.js'
const router = express.Router();

router.get('/documentViewer', cont.renderDocumentViewer);
router.get('/documentEditor', cont.renderDocumentEditor);
router.get('/workspace', cont.renderEntryWorkspace);

export default router;
