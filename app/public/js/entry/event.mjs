import { openImportListModal, openExportListModal } from './listTool/index.mjs';
import {
    openSpriteManager,
    openPictureManager,
    openPictureImport,
    openSoundManager,
    openTableManager,
    openExpansionBlockManager,
    openAIUtilizeBlockManager,
} from './popup/index.mjs';

import { saveCanvasImage } from './picture/index.mjs';
import { saveSoundBuffer } from './sound/index.mjs';

export function installEntryEvent() {
    Entry.addEventListener('dismissModal');
    Entry.addEventListener('openSpriteManager', openSpriteManager);
    Entry.addEventListener('openPictureManager', openPictureManager);
    Entry.addEventListener('openPictureImport', openPictureImport);
    Entry.addEventListener('openSoundManager', openSoundManager);
    Entry.addEventListener('openImportListModal', openImportListModal);
    Entry.addEventListener('openExportListModal', openExportListModal);
    Entry.addEventListener('openTableManager', openTableManager);
    Entry.addEventListener('openExpansionBlockManager', openExpansionBlockManager);
    Entry.addEventListener('openAIUtilizeBlockManager', openAIUtilizeBlockManager);


    // 실행 상태 저장
    Entry.addEventListener('run', ()=>{Entry.running = true});
    Entry.addEventListener('stop', ()=>{Entry.running = false;});
    
    // 그림판 이미지 저장
    Entry.addEventListener('saveCanvasImage', saveCanvasImage);

    // 사운드 편집 저장
    Entry.addEventListener('saveSoundBuffer', saveSoundBuffer);
}
