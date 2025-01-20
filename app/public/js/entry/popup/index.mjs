import { setSpritePopupEvent } from './sprite.mjs';
import { setPicturePopupEvent } from './picture.mjs';
import { setPainterPopupEvent } from './painter.mjs';
import { setSoundPopupEvent } from './sound.mjs';
import { setTablePopupEvent } from './table.mjs';
import { getExpansionBlocks, setExpansionPopupEvent } from './expansion.mjs';
import { getAiUtilizeBlocks, setAIUtilizePopupEvent } from './aIUtilize.mjs';
import { getSidebarTemplate } from '../util.mjs';
import { fetchWithBaseUrl } from '../util/index.mjs';

var popup;


export function uploadFail(data) {
    EntryModal.alert(Lang[data.messageParent][data.message]);
}
export function failAlert() {
    window.EntryModal.alert(Lang.Msgs.error_occured);
}

export function installPopup() {
    const container = document.getElementById('EntryPopupContainer');
    popup = new EntryTool.Popup({
        container,
        isShow: false,
        theme: 'entry',
        data: { data: { data: [] } },
    });
    popup.setData({
        projectNavOptions: {
            categoryOptions: ['all', 'game', 'living', 'storytelling', 'arts', 'knowledge', 'etc'],
            sortOptions: ['updated', 'visit', 'likeCnt', 'comment'],
            periodOptions: ['all', 'today', 'week', 'month', 'quarter'],
        },
    });
}

export async function openSpriteManager() {
    popup.removeAllListeners();
    setSpritePopupEvent(popup);
    const data = await fetchWithBaseUrl('/api/entry/sprite/categories');
    const sidebar = getSidebarTemplate(data);
    popup.setData({ sidebar });
    popup.show({ type: 'sprite' }, {});
}

export async function openPictureManager() {
    popup.removeAllListeners();
    setPicturePopupEvent(popup);
    const data = await fetchWithBaseUrl('/api/entry/picture/categories');
    const sidebar = getSidebarTemplate(data);
    popup.setData({ sidebar });
    popup.show({ type: 'picture' }, {});
}

export async function openPictureImport() {
    popup.removeAllListeners();
    setPainterPopupEvent(popup);
    const data = await fetchWithBaseUrl('/api/entry/picture/categories');
    const sidebar = getSidebarTemplate(data);
    popup.setData({ sidebar });
    popup.show({ type: 'paint' }, {});
}

export async function openSoundManager() {
    popup.removeAllListeners();
    setSoundPopupEvent(popup);
    const data = await fetchWithBaseUrl('/api/entry/sound/categories');
    const sidebar = getSidebarTemplate(data);
    popup.setData({ sidebar });
    popup.show({ type: 'sound' }, {});
}

export function openTableManager(data) {
    popup.removeAllListeners();
    setTablePopupEvent(popup);
    popup.setData({ sidebar: {} });
    popup.show({ type: 'table' }, { data: { data: [] } });
}

export function openExpansionBlockManager() {
    popup.removeAllListeners();
    setExpansionPopupEvent(popup);
    popup.setData({ sidebar: {} });
    popup.show(
        { type: 'expansion', imageBaseUrl: '/@entrylabs/entry/images/hardware/' },
        { data: { data: getExpansionBlocks() } }
    );
}

export function openAIUtilizeBlockManager() {
    popup.removeAllListeners();
    setAIUtilizePopupEvent(popup);
    popup.setData({ sidebar: {} });
    popup.show(
        { type: 'aiUtilize', imageBaseUrl: '/@entrylabs/entry/images/aiUtilize/' },
        { data: { data: getAiUtilizeBlocks() } }
    );
}
