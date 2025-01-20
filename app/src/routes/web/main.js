import express from 'express';
import { getAccessModifier, ROLE as R } from '#middlewares/session.middleware.js';
import * as cont from '#controllers/web/main.controller.js';

const router = express.Router();

router.get('/', cont.renderMainpage);
router.get('/search', cont.renderSearch);


export default router;