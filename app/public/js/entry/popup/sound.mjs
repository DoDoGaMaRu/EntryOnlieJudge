import { uploadFail, failAlert } from './index.mjs';
import { fetchUploadWithBaseUrl, fetchWithBaseUrl } from '../util/index.mjs';

function addSounds(data) {
    const sounds = data.selected;
    sounds.forEach((item) => {
        item.id = Entry.generateHash();
        Entry.playground.addSound(item, true);
    });
    Entry.Utils.forceStopSounds();
}

function loadSound(items) {
    items.forEach((item) => {
        if (!Entry.soundQueue.getItem(item.id) && item.path) {
            Entry.soundQueue.loadFile({
                id: item.id,
                src: item.fileurl || item.path,
                type: createjs.LoadQueue.SOUND,
            });
        }
    });
}

function stopAllSound() {
    Entry.Utils.forceStopSounds();
}

function stopSound(sound) {
    const { instance, callback } = sound;
    instance && instance.stop();
    callback({
        status: false,
    });
}

function soundLoadAndPlay(item) {
    const { id, callback } = item;
    if (!Entry.soundQueue.getItem(item.id)) {
        let playFunc;
        const soundPlay = () => {
            if (Entry.soundQueue.getResult(id)) {
                const instance = Entry.Utils.playSound(id);
                Entry.Utils.addSoundInstances(instance);
                callback({ instance, status: true });
                instance.on('complete', () => callback({ status: false }));
            }
            Entry.soundQueue.off('fileload', playFunc);
        };
        playFunc = Entry.soundQueue.on('fileload', soundPlay);
        Entry.soundQueue.loadFile({
            id: item.id,
            src: item.fileurl || item.path,
            type: createjs.LoadQueue.SOUND,
        });
    }
    return item;
}

function playSound(item) {
    const { id, callback } = item;
    if (id) {
        if (Entry.soundQueue.getResult(id)) {
            const instance = Entry.Utils.playSound(id);
            Entry.Utils.addSoundInstances(instance);
            callback({ instance, status: true });
            instance.on('complete', () => callback({ status: false }));
        } else {
            soundLoadAndPlay(item);
        }
    } else {
        console.log('no sound', id);
    }
}

function uploadSounds(data) {
    const sounds = data.uploads;
    sounds.forEach((item) => {
        item.id = Entry.generateHash();
        Entry.playground.addSound(item, true);
    });
    Entry.Utils.forceStopSounds();
}

export function setSoundPopupEvent(popup) {
    popup.on('fetch', async (category) => {
        const { sidebar, subMenu } = category;
        const data = await fetchWithBaseUrl(`/api/entry/sound/categories/${sidebar}/${subMenu}`);
        popup.setData({ data: { data } });
    });
    popup.on('search', async ({ searchQuery }) => {
        if (searchQuery.trim() !== '') {
            const data = await fetchWithBaseUrl(`/api/entry/sound/search?query=${searchQuery}`);
            popup.setData({ data: { data } });
        }
    });
    popup.on('dummyUploads', async ({ formData }) => {
        const url = Entry.volatileUpload? `/api/entry/ws/sound` : `/api/entry/sound`;
        const data = await fetchUploadWithBaseUrl(url, {
            method: 'post',
            body: formData,
        });
        const uploads = data.uploads.map(upload => {
            upload['_id'] = Entry.generateHash();
            return upload;
        });
        popup.setData({
            data: { uploads: uploads, data: [] },
        });
    });
    popup.on('submit', addSounds);
    popup.on('loaded', loadSound);
    popup.on('load', loadSound);
    popup.on('hide', stopAllSound);
    popup.on('play', playSound);
    popup.on('stop', stopSound);
    popup.on('uploads', uploadSounds);
    popup.on('uploadFail', uploadFail);
    popup.on('fail', failAlert);
    popup.on('error', failAlert);
}
