import { installPopup } from './popup/index.mjs';
import { installListTool } from './listTool/index.mjs';
import { installEntryEvent } from './event.mjs';
import { installModalProgress } from './modalProgress/index.mjs';
import { initIframe } from './iframeEvent.mjs';


document.addEventListener('DOMContentLoaded', () => {
    if (self !== top) {
        initIframe((option) => {
            initEntry(option);
        });
    }
});

function initEntry(initOption) {
    var defaultOption = {
        libDir: '',
        type: 'workspace',
        baseUrl: '/',
        textCodingEnable: true,
        backpackDisable: true,
        exportObjectEnable: true,
        blockSaveImageEnable: false,
        iframeDomAccess: 'none',
    };
    const option = Object.assign({}, defaultOption, initOption);

    Entry.creationChangedEvent = new Entry.Event(window);
    Entry.init(document.getElementById('workspace'), option);
    installPopup();
    installModalProgress();
    installListTool();
    installEntryEvent();
}

