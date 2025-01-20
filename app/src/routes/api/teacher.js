import express from 'express';

import { sessionSync, getAccessModifier, ROLE as R } from '#middlewares/session.middleware.js';
import * as cont from '#controllers/api/teacher.controller.js';

const router = express.Router();
router.use(sessionSync, getAccessModifier(R.TEACHER));


router.put('/users', cont.updateUserInfo);

router.post('/groups', cont.insertGroup);
router.delete('/groups', cont.deleteGroup);
router.post('/groups/users', cont.registerUserAtGroup);
router.delete('/groups/users', cont.unregisterUserAtGroup);

router.post('/missions', cont.insertMission);
router.delete('/missions/:missionOid', cont.deleteMission);
router.post('/missions/active', cont.activeMissionProgress);

router.post('/missions/subtask', cont.insertSubtask);
router.delete('/missions/subtask/:subtaskOid', cont.deleteSubtask);
router.post('/missions/subtask/:subtaskStateOid', cont.updateMissionProgress);
export default router;