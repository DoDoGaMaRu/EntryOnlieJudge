import express from 'express';

import { sessionSync, getAccessModifier, ROLE as R } from '#middlewares/session.middleware.js';
import * as cont from '#controllers/api/solution.controller.js';

const router = express.Router();

router.get('/', sessionSync, cont.getSolutions);
router.get('/:solutionKey', sessionSync, cont.getSolution);
router.post('/submit', sessionSync, getAccessModifier(R.USER), cont.judge);

export default router;