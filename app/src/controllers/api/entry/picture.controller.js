import path from 'path';
import sizeOf from 'image-size';

import AssetMetaLoader from '#utils/assetMetaLoader.js';

const aml = new AssetMetaLoader();
aml.caching('picture_category');
aml.caching('picture');


const toPicture = (file) => {
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
        imageType: path.extname(file.originalname).slice(1)
    };
}


// API handlers
export function getCategories(req, res) {
    res.send(aml.get('picture_category'));
}

export function getPictures(req, res) {
    const { main_category, sub_category } = req.params;

    if (!main_category || !sub_category) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    const filteredPictures = aml.get('picture').filter(({ category }) => {
        const { main, sub } = category;
        return main_category === main && (sub_category === 'all' || sub_category === sub);
    });

    res.send(filteredPictures);
}

export function getPicturesBySearchTerm(req, res) {
    const query = req.query.query;

    if (!query) {
        return res.status(400).send('Query parameter is required');
    }

    const filteredPictures = aml.get('picture').filter(({ name }) => {
        return name.includes(query);
    });

    res.send(filteredPictures);
}

export function uploadPictureAsset(_req, res) {
    try {
        const pictures = _req.files.map(toPicture);
        res.send({
            uploads: pictures,
        });
    } catch (error) {
        console.error(error);
        res.sendStatus(400);
    }
}

export function savePaintedPicture(_req, res) {
    try {
        const picture = toPicture(_req.file);
        res.send(picture);
    } catch (error) {
        console.error(error);
        res.sendStatus(400);
    }
}
