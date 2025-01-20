import { closeModalProgress, openModalProgress } from '../modalProgress/index.mjs';
import { fetchWithBaseUrl } from '../util/index.mjs';

let isSavingCanvasData;

function setPicture({ picture, file }) {
    updatePictureProperties(picture, file);
    const entityId = getEntityId(picture);
    selectAppropriatePicture(picture, entityId);
}

function updatePictureProperties(picture, file) {
    if (file.mode === 'new') {
        picture.name = '새 그림';
        Entry.playground.addPicture(picture, true);
    } else {
        Object.assign(picture, {
            id: file.id,
            name: file.name,
            objectId: file.objectId,
        });
        Entry.playground.setPicture(picture);
    }
}

function getEntityId(picture) {
    if (!picture.objectId) {
        return Entry.playground?.object?.entity?.id;
    }
    const obj = Entry.container.getObject(picture.objectId);
    return obj && obj.entity ? obj.entity.id : null;
}

function selectAppropriatePicture(picture, entityId) {
    const { playground } = Entry;
    if (playground.painter.file.id === picture.id) {
        playground.selectPicture(picture);
    } else if (playground.object && picture.objectId !== playground.object.id) {
        Entry.container.selectPicture(picture.id, picture.objectId);
    }
}

async function saveCanvasImage({ image, file }) {
    if (isSavingCanvasData) {
        EntryModal.alert('이미 저장 중 입니다.');
        return;
    }
    openModalProgress('저장 중이에요.');
    isSavingCanvasData = true;

    
    const url = Entry.volatileUpload? `/api/entry/ws/picture/paint` : `/api/entry/picture/paint`;
    try {
        const picture = await fetchWithBaseUrl(url, {
            method: 'POST',
            body: JSON.stringify({ image, file }),
        });
        setPicture({ picture, file });
    } catch (e) {
        console.error('캔버스 이미지 저장에 실패했습니다:', e);
    } finally {
        closeModalProgress();
        isSavingCanvasData = false;
    }
}

export { saveCanvasImage };
