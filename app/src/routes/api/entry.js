import express from 'express';
import upload from '#middlewares/upload.middleware.js';
import { thumbMiddleware96, thumbMiddleware96Ws } from '#middlewares/thumb.middleware.js';
import { sessionSync, getAccessModifier, ROLE as R  } from '#middlewares/session.middleware.js';

import * as pictureCont from '#controllers/api/entry/picture.controller.js';
import * as soundCont from '#controllers/api/entry/sound.controller.js';
import * as spriteCont from '#controllers/api/entry/sprite.controller.js';
import * as tableCont from '#controllers/api/entry/table.controller.js';
import * as additionCont from '#controllers/api/entry/addition.controller.js'; 

const router = express.Router();

router.get('/picture/categories', pictureCont.getCategories);
router.get('/picture/categories/:main_category/:sub_category', pictureCont.getPictures);
router.get('/picture/search', pictureCont.getPicturesBySearchTerm);
router.post('/picture', sessionSync, getAccessModifier(R.USER), upload.images, thumbMiddleware96, pictureCont.uploadPictureAsset);
router.post('/picture/paint', sessionSync, getAccessModifier(R.USER), upload.base64Image, thumbMiddleware96, pictureCont.savePaintedPicture);

router.get('/sound/categories', soundCont.getCategories);
router.get('/sound/categories/:main_category/:sub_category', soundCont.getSounds);
router.get('/sound/search', soundCont.getSoundsBySearchTerm);
router.post('/sound', sessionSync, getAccessModifier(R.USER), upload.sounds, soundCont.uploadSoundAsset);
router.post('/sound/modify', sessionSync, getAccessModifier(R.USER), upload.sounds, soundCont.saveModifiedSound);

router.get('/sprite/categories', spriteCont.getCategories);
router.get('/sprite/categories/:main_category/:sub_category', spriteCont.getSprites);
router.get('/sprite/search', spriteCont.getSpritesBySearchTerm);
router.post('/sprite', sessionSync, getAccessModifier(R.USER), upload.images, thumbMiddleware96, spriteCont.uploadSpriteAsset);

router.get('/table', tableCont.getTable);
router.get('/table/search', tableCont.getTableBySearchTerm);
router.post('/table', sessionSync, getAccessModifier(R.USER), upload.tables, tableCont.uploadTable);

router.post('/addition/ent', sessionSync, getAccessModifier(R.USER), upload.onMemories, additionCont.entUnpack);


// Workspace용 api(갤러리 작품)
router.post('/ws/picture', sessionSync, getAccessModifier(R.USER), upload.imagesWs, thumbMiddleware96Ws, pictureCont.uploadPictureAsset);
router.post('/ws/picture/paint', sessionSync, getAccessModifier(R.USER), upload.base64ImageWs, thumbMiddleware96Ws, pictureCont.savePaintedPicture);

router.post('/ws/sound', sessionSync, getAccessModifier(R.USER), upload.soundsWs, soundCont.uploadSoundAsset);
router.post('/ws/sound/modify', sessionSync, getAccessModifier(R.USER), upload.soundsWs, soundCont.saveModifiedSound);

router.post('/ws/sprite', sessionSync, getAccessModifier(R.USER), upload.imagesWs, thumbMiddleware96Ws, spriteCont.uploadSpriteAsset);

router.post('/ws/table', sessionSync, getAccessModifier(R.USER), upload.tablesWs, tableCont.uploadTable);

router.post('/ws/addition/ent', sessionSync, getAccessModifier(R.USER), upload.onMemories, additionCont.entUnpackWs);


export default router;