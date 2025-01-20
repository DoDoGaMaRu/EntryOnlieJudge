import express from 'express';
import { getAccessModifier, ROLE as R } from '#middlewares/session.middleware.js';
import * as cont from '#controllers/web/teacher.controller.js';

const router = express.Router();
router.use(getAccessModifier(R.TEACHER));

router.get('/groups', cont.renderGroupList);
router.get('/groups/new', cont.renderGroupForm);
router.get('/groups/:groupOid/users', cont.renderGroupUserList);
router.get('/groups/:groupOid/missions', cont.renderGroupMissionList);

router.get('/users', cont.renderUserList);
router.get('/users/:userId', cont.renderUserManagement);
router.get('/users/:userId/missions/:missionOid', cont.renderUserMissionProgress);

router.get('/practices', cont.renderPracticeList);
router.get('/practices/new', cont.renderPracticeForm);
router.get('/practices/modify/:practiceKey', cont.renderPracticeModifyForm);

router.get('/missions', cont.renderMissionList);
router.get('/missions/new', cont.renderMissionForm);
router.get('/missions/:missionOid', cont.renderMissionManagement);


export default router;