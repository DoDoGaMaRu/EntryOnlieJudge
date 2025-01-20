import path from 'path';
import { getAudioDurationInSeconds  } from 'get-audio-duration';


import AssetMetaLoader from '#utils/assetMetaLoader.js';

const aml = new AssetMetaLoader();
aml.caching('sound_category');
aml.caching('sound');

const toSound = async (file) => {
    const ext = path.extname(file.originalname);
    const duration = await getAudioDurationInSeconds(file.path);
    
    file.path = `/rookie/${file.path}`;
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
        ext: ext,
    };
}

// API handlers
export function getCategories(req, res) {
    res.send(aml.get('sound_category'));
}

export function getSounds(req, res) {
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

export function getSoundsBySearchTerm(req, res) {
    const query = req.query.query;

    if (!query) {
        return res.status(400).send('Query parameter is required');
    }

    const filteredSounds = aml.get('sound').filter(({ name }) => {
        return name.includes(query);
    });

    res.send(filteredSounds);
}

export async function uploadSoundAsset(_req, res) {
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

export async function saveModifiedSound(_req, res) {
    try {
        const sound = await toSound(_req.files[0]);
        res.send(sound);
    } catch (error) {
        console.error(error);
        res.sendStatus(400);
    }
}