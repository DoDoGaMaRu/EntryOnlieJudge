import express from 'express';
import { getAccessModifier, ROLE as R } from '#middlewares/session.middleware.js';
import * as cont from '#controllers/web/admin.controller.js';

const router = express.Router();
router.use(getAccessModifier(R.ADMIN));

router.get('/teachers', cont.renderTeacherList);
router.get('/editor', cont.renderTextEditor);
router.get('/data', cont.renderDataManagement);

export default router;