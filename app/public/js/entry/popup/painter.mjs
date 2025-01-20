import { uploadFail, failAlert } from './index.mjs';
import { fetchUploadWithBaseUrl, fetchWithBaseUrl } from '../util/index.mjs';

function addPictures(data) {
    const pictures = data.selected;
    pictures.forEach((picture) => {
        picture.id = Entry.generateHash();
        Entry.playground.painter.addPicture(picture, false);
    });
}

function addEmptyPicture() {
    const item = {
        id: Entry.generateHash(),
        dimension: {
            height: 1,
            width: 1,
        },
        fileurl: `${Entry.mediaFilePath}_1x1.png`,
        thumbUrl: `${Entry.mediaFilePath}_1x1.png`,
        name: Lang.Workspace.new_picture,
    };
    Entry.playground.addPicture(item, true);
}

function uploadPictures(data) {
    const pictures = data.uploads;
    pictures.forEach((picture) => {
      Entry.playground.painter.addPicture(picture, false);
    });
}

export function setPainterPopupEvent(popup) {
    popup.on('fetch', async (category) => {
        const { sidebar, subMenu } = category;
        const data = await fetchWithBaseUrl(`/api/entry/picture/categories/${sidebar}/${subMenu}`);
        popup.setData({ data: { data } });
    });
    popup.on('search', async ({ searchQuery }) => {
        if (searchQuery.trim() !== '') {
            const data = await fetchWithBaseUrl(`/api/entry/picture/search?query=${searchQuery}`);
            popup.setData({ data: { data } });
        }
    });
    popup.on('dummyUploads', async ({ formData }) => {
        const url = Entry.volatileUpload? `/api/entry/ws/picture` : `/api/entry/picture`;
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
    popup.on('submit', addPictures);
    popup.on('draw', addEmptyPicture);
    popup.on('uploads', uploadPictures);
    popup.on('uploadFail', uploadFail);
    popup.on('fail', failAlert);
    popup.on('error', failAlert);
}
