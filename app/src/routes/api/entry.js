import express from 'express';
import path from 'path';
import upload from '../../lib/upload.js';
import ThumbCreator from '../../lib/ThumbCreator.js';

import * as pictureCont from '../../controllers/picture.js';
import * as soundCont from '../../controllers/sound.js';
import * as spriteCont from '../../controllers/sprite.js';
import * as tableCont from '../../controllers/table.js';

const router = express.Router();

const tc = new ThumbCreator(96, (file) => {
    const firstDir = file.name.slice(0,2);
    const secondDir = file.name.slice(2,4);
    return path.join('uploads', firstDir, secondDir, 'thumb');
});

router.get('/picture/categories', pictureCont.getCategories);
router.get('/picture/categories/:main_category/:sub_category', pictureCont.getPictures);
router.get('/picture/search', pictureCont.getPicturesBySearchTerm);
router.post('/picture', upload.images, tc.create, pictureCont.uploadPictureAsset);
router.post('/picture/paint', upload.base64Image, tc.create, pictureCont.savePaintedPicture);

router.get('/sound/categories', soundCont.getCategories);
router.get('/sound/categories/:main_category/:sub_category', soundCont.getSounds);
router.get('/sound/search', soundCont.getSoundsBySearchTerm);
router.post('/sound', upload.sounds, soundCont.uploadSoundAsset);

router.get('/sprite/categories', spriteCont.getCategories);
router.get('/sprite/categories/:main_category/:sub_category', spriteCont.getSprites);
router.get('/sprite/search', spriteCont.getSpritesBySearchTerm);
router.post('/sprite', upload.images, tc.create, spriteCont.uploadSpriteAsset);

router.get('/table', tableCont.getTable);
router.get('/table/search', tableCont.getTableBySearchTerm);
router.post('/table', upload.tables, tableCont.uploadTable);

export default router;