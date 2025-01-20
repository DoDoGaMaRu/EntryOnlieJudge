import express from 'express';
import { getAccessModifier, ROLE as R } from '#middlewares/session.middleware.js';

import * as cont from '#controllers/web/users.controller.js';

const router = express.Router();
router.use(getAccessModifier(R.USER));

router.get('/:userId', cont.renderUserPage);
router.get('/:userId/gallery', cont.renderUserGallery);
router.get('/:userId/gallery/:workspaceOid', cont.renderProjectPage);
router.get('/:userId/gallery/:workspaceOid/edit', cont.renderProjectInfoForm);

router.get('/:userId/groups', cont.renderUserGroup);
router.get('/:userId/missions', cont.renderUserMission);

export default router;