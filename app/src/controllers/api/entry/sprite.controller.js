import path from 'path';
import sizeOf from 'image-size';

import AssetMetaLoader from '#utils/assetMetaLoader.js';

const aml = new AssetMetaLoader();
aml.caching('sprite_category');
aml.caching('sprite');


const toSprite = (file) => {
    const dimension = sizeOf(file.path);
    file.path = `/rookie/${file.path}`
    file.thumbPath = `/rookie/${file.thumbPath}`;
    return {
        name: file.originalname,
        fileurl: file.path,
        thumbUrl: file.thumbPath,
        label: {
            ko: file.originalname,
            en: file.originalname,
            ja: file.originalname,
            vn: file.originalname,
        },
        dimension: {
            width: dimension.width,
            height: dimension.height,
        },
        type: 'user',
        specials: [],
        origin: {
            fileurl: file.path,
            thumbUrl: file.thumbPath,
            width: dimension.width,
            height: dimension.height,
        },
        imageType: path.extname(file.originalname).slice(1)
    };
}


// API handlers
export function getCategories(req, res) {
    res.send(aml.get('sprite_category'))
}

export function getSprites(req, res) {
    const { main_category, sub_category } = req.params;

    if (!main_category || !sub_category) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    const filteredSprites = aml.get('sprite').filter(({ category }) => {
        const { main, sub } = category;
        return main_category === main && (sub_category === 'all' || sub_category === sub);
    });

    res.send(filteredSprites);
}

export function getSpritesBySearchTerm(req, res) {
    const query = req.query.query;

    if (!query) {
        return res.status(400).send('Query parameter is required');
    }

    const filteredSprites = aml.get('sprite').filter(({ name }) => {
        return name.includes(query);
    });

    res.send(filteredSprites);
}

export function uploadSpriteAsset(_req, res) {
    try {
        const sprites = _req.files.map(toSprite);
        res.send({
            uploads: sprites,
        });
    } catch (error) {
        console.error(error);
        res.sendStatus(400);
    }
}
