import express from 'express';
import { getAccessModifier, ROLE as R } from '#middlewares/session.middleware.js';

import * as cont from '#controllers/web/solution.controller.js'

const router = express.Router();

router.get('/', cont.renderSolutionList);
router.get('/:solutionKey', cont.renderSolutionPage);

export default router;