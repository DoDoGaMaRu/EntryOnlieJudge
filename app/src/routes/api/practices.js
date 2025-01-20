import express from 'express';

import * as cont from '#controllers/api/practice.controller.js';
import { sessionSync, getAccessModifier, ROLE as R } from '#middlewares/session.middleware.js';

const router = express.Router();

router.get('/', cont.getPractices);
router.get('/:practiceKey', cont.getPractice);
router.delete('/:practiceKey', sessionSync, getAccessModifier(R.TEACHER), cont.deletePractice);
router.post('/', sessionSync, getAccessModifier(R.TEACHER), cont.upsertPractice);

router.get('/ws/:practiceKey', sessionSync, cont.getTempProject);
router.get('/ws/:practiceKey/:userId', sessionSync, getAccessModifier(R.TEACHER), cont.getOtherTempProject);
router.post('/ws/:practiceKey', sessionSync, cont.upsertTempProject);

export default router;