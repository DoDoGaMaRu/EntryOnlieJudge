import express from 'express';
import { getAccessModifier, ROLE as R } from '#middlewares/session.middleware.js';

import * as cont from '#controllers/web/ranking.controller.js';

const router = express.Router();

router.get('/', cont.renderRanking);

export default router;