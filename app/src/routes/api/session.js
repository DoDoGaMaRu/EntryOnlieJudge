import express from 'express';
import * as cont from '../../controllers/session.js';

const router = express.Router();

router.post('/sync', cont.sessionSync);

export default router;