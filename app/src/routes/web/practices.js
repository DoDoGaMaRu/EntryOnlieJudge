import express from 'express';
import { getAccessModifier, ROLE as R } from '#middlewares/session.middleware.js';
import * as cont from '#controllers/web/practice.controller.js';

const router = express.Router();

router.get('/ws/:practiceKey', getAccessModifier(R.USER), cont.renderPracticePage);
export default router;