import express from 'express';
import { getAccessModifier, ROLE as R } from '#middlewares/session.middleware.js';
import * as cont from '#controllers/web/problem.controller.js'

const router = express.Router();

router.get('/', cont.renderProblemList);
router.get('/ws/:problemKey', cont.renderProblemPage);
router.get('/new', getAccessModifier(R.TEACHER), cont.renderNewProblemForm);
router.get('/modify/:problemKey', getAccessModifier(R.TEACHER), cont.renderModifyProblemForm);

export default router;
