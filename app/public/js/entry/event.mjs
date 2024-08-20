import { openImportListModal, openExportListModal } from './listTool/index.mjs';
import {
    openSpriteManager,
    openPictureManager,
    openSoundManager,
    openTableManager,
    openExpansionBlockManager,
    openAIUtilizeBlockManager,
} from './popup/index.mjs';

import { saveCanvasImage } from './picture/index.mjs';

export function installEntryEvent() {
    Entry.addEventListener('dismissModal');
    Entry.addEventListener('openSpriteManager', openSpriteManager);
    Entry.addEventListener('openPictureManager', openPictureManager);
    Entry.addEventListener('openSoundManager', openSoundManager);
    Entry.addEventListener('openImportListModal', openImportListModal);
    Entry.addEventListener('openExportListModal', openExportListModal);
    Entry.addEventListener('openTableManager', openTableManager);
    Entry.addEventListener('openExpansionBlockManager', openExpansionBlockManager);
    Entry.addEventListener('openAIUtilizeBlockManager', openAIUtilizeBlockManager);

    //그림판 이미지 저장
    Entry.addEventListener('saveCanvasImage', saveCanvasImage);
}
