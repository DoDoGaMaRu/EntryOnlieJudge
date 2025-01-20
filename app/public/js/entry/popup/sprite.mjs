import { uploadFail, failAlert } from './index.mjs';
import { fetchUploadWithBaseUrl, fetchWithBaseUrl } from '../util/index.mjs';

function addObjects(data) {
    const objects = data.selected;
    objects.forEach((sprite) => {
        const object = {
            id: Entry.generateHash(),
            objectType: 'sprite',
            sprite,
        };
        Entry.container.addObject(object, 0);
    });
}

function addEmptyObject() {
    const object = {
        id: Entry.generateHash(),
        objectType: 'sprite',
        sprite: {
            name: Lang.Workspace.new_object + (Entry.container.getAllObjects().length + 1),
            pictures: [
                {
                    dimension: {
                        width: 960,
                        height: 540,
                    },
                    fileurl: `${Entry.mediaFilePath}_1x1.png`,
                    thumbUrl: `${Entry.mediaFilePath}_1x1.png`,
                    name: Lang.Workspace.new_picture,
                    type: '_system_',
                },
            ],
            sounds: [],
            category: {
                main: 'new',
            },
        },
    };
    Entry.container.addObject(object, 0);
    Entry.playground.changeViewMode('picture');
}

function addTextObject(data) {
    let lineBreak = true;
    if (data.writeType === 'one') {
        lineBreak = false;
    }
    const text = data.text || Lang.Blocks.TEXT;
    const object = {
        id: Entry.generateHash(),
        name: text,
        text,
        options: {
            font: data.font,
            bold: false,
            underLine: false,
            italic: false,
            strike: data.effects.through || false,
            colour: data.effects.color || '#000000',
            background: data.effects.backgroundColor || '#ffffff',
            lineBreak,
            ...data.effects,
        },
        objectType: 'textBox',
        sprite: { sounds: [], pictures: [] },
    };
    Entry.container.addObject(object, 0);
}

function uploadObjects(data) {
    const objects = data.uploads;
    objects.forEach((item) => {
        if (!item.id) {
            item.id = Entry.generateHash();
        }

        const object = {
            id: Entry.generateHash(),
            objectType: 'sprite',
            sprite: {
                name: item.name,
                pictures: [item],
                sounds: [],
                category: {},
            },
        };
        Entry.container.addObject(object, 0);
    });
}

export function setSpritePopupEvent(popup) {
    popup.on('fetch', async (category) => {
        const { sidebar, subMenu } = category;
        const data = await fetchWithBaseUrl(`/api/entry/sprite/categories/${sidebar}/${subMenu}`);
        popup.setData({ data: { data } });
    });
    popup.on('search', async ({ searchQuery }) => {
        if (searchQuery.trim() !== '') {
            const data = await fetchWithBaseUrl(`/api/entry/sprite/search?query=${searchQuery}`);
            popup.setData({ data: { data } });    
        }
    });
    popup.on('dummyUploads', async ({ formData }) => {
        const url = Entry.volatileUpload? `/api/entry/ws/sprite` : `/api/entry/sprite`;
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
    popup.on('submit', addObjects);
    popup.on('draw', addEmptyObject);
    popup.on('write', addTextObject);
    popup.on('uploads', uploadObjects);
    popup.on('uploadFail', uploadFail);
    popup.on('fail', failAlert);
    popup.on('error', failAlert);
}
