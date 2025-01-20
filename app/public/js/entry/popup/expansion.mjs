function addExpansionBlocks(data) {
    const blocks = data.selected;
    Entry.dispatchEvent('popupAddBlocks', { category: 'expansion', blocks });
    const addBlocks = blocks.filter(({ name }) => !Entry.expansionBlocks.includes(name));
    const removeBlocks = getExpansionBlocks()
        .filter((item) => item.active)
        .filter((item) => !blocks.includes(item));
    Entry.playground.addExpansionBlocks(addBlocks, true, true);
    Entry.playground.removeExpansionBlocks(removeBlocks, true, true);
}

function offExpansionBlocks({ data, callback }) {
    const isActive = Entry.expansion.isActive(data.name);
    if (!isActive) {
        callback && callback();
    } else {
        EntryModal.alert(Lang.Workspace.deselect_expansion_block_warning);
    }
}

function onExpansionBlocks({ callback }) {
    callback && callback();
}

export function getExpansionBlocks() {
    return Object.values(Entry.EXPANSION_BLOCK_LIST).filter((item) => {
        item.active = Entry.expansionBlocks.includes(item.name);
        return item;
    });
}

export function setExpansionPopupEvent(popup) {
    popup.on('submit', addExpansionBlocks);
    popup.on('itemoff', offExpansionBlocks);
    popup.on('itemon', onExpansionBlocks);
}
