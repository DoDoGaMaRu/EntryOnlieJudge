function addAIUtilizeBlocks(data) {
    const blocks = data.selected;
    Entry.dispatchEvent('popupAddBlocks', { category: 'ai_utilize', blocks });
    const addBlocks = blocks.filter(({ name }) => !Entry.aiUtilizeBlocks.includes(name));
    const removeBlocks = getAiUtilizeBlocks()
        .filter((item) => item.active)
        .filter((item) => !blocks.includes(item));
    Entry.playground.addAIUtilizeBlocks(addBlocks, true, true);
    Entry.playground.removeAIUtilizeBlocks(removeBlocks, true, true);
}

function offAIUtilizeBlocks({ data, callback }) {
    const isActive = Entry.aiUtilize.isActive(data.name);
    if (!isActive) {
        callback && callback();
    } else {
        EntryModal.alert(Lang.Workspace.deselect_ai_utilize_block_warning);
    }
}

function onAIUtilizeBlocks({ callback }) {
    callback && callback();
}

const useList = ['gestureRecognition', 'poseLandmarker', 'faceLandmarker', 'objectDetector'];

export function getAiUtilizeBlocks() {
    return Object.values(Entry.AI_UTILIZE_BLOCK_LIST).filter((item) => {
        if (!useList.includes(item.name)) {
            return false;
        }
        item.active = Entry.aiUtilizeBlocks.includes(item.name);
        return item;
    });
}

export function setAIUtilizePopupEvent(popup) {
    popup.on('submit', addAIUtilizeBlocks);
    popup.on('itemoff', offAIUtilizeBlocks);
    popup.on('itemon', onAIUtilizeBlocks);
}
