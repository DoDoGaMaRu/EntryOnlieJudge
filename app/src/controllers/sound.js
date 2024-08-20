import fs from 'fs';
import path from 'path';
import mp3Duration from 'mp3-duration'


import AssetMetaLoader from '../lib/AssetMetaLoader.js';

const aml = new AssetMetaLoader();

const toSound = async (file) => {
    const buffer = fs.readFileSync(file.path);
    const duration = await mp3Duration(buffer);
    
    file.path = `/${file.path}`
    return {
        name: file.originalname,
        fileurl: file.path,
        path: file.path,
        label: {
            ko: file.originalname,
            en: file.originalname,
            ja: file.originalname,
            vn: file.originalname,
        },
        duration: duration,
        ext: path.extname(file.originalname),
    };
}

function getCategories(req, res) {
    res.send(aml.get('sound_category'));
}

function getSounds(req, res) {
    const { main_category, sub_category } = req.params;

    if (!main_category || !sub_category) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    const filteredSounds = aml.get('sound').filter(({ category }) => {
        const { main, sub } = category;
        return main_category === main && (sub_category === 'all' || sub_category === sub);
    });

    res.send(filteredSounds);
}

function getSoundsBySearchTerm(req, res) {
    const query = req.query.query;

    if (!query) {
        return res.status(400).send('Query parameter is required');
    }

    const filteredSounds = aml.get('sound').filter(({ name }) => {
        return name.includes(query);
    });

    res.send(filteredSounds);
}

async function uploadSoundAsset(_req, res) {
    try {
        let sounds = _req.files.map(toSound);
        sounds = await Promise.all(sounds);
        res.send({
            uploads: sounds
        });
    }
    catch (error) {
        console.error(error);
        res.sendStatus(400);
    }
}

export { getCategories, getSounds, getSoundsBySearchTerm, uploadSoundAsset };
