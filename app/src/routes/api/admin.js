import express from 'express';

import { sessionSync, getAccessModifier, ROLE as R } from '#middlewares/session.middleware.js';
import * as cont from '#controllers/api/admin.controller.js';

const router = express.Router();
router.use(sessionSync, getAccessModifier(R.ADMIN));

router.put('/users/:userId/role', cont.updateRole);
router.delete('/data/uploads', cont.deleteDereferencedUploads);
export default router;