import express from 'express';

import { sessionSync, getAccessModifier, ROLE as R } from '#middlewares/session.middleware.js';
import * as cont from '#controllers/api/problem.controller.js';

const router = express.Router();

router.get('/', sessionSync, cont.getProblems);
router.get('/:problemKey', cont.getProblem);
router.delete('/:problemKey', sessionSync, getAccessModifier(R.TEACHER), cont.deleteProblem)
router.post('/', sessionSync, getAccessModifier(R.TEACHER), cont.upsertProblem);

router.get('/ws/:problemKey', sessionSync, cont.getTempProject);
router.post('/ws/:problemKey', sessionSync, cont.upsertTempProject);

export default router;