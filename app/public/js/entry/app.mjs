import { installPopup } from './popup/index.mjs';
import { installListTool } from './listTool/index.mjs';
import { installEntryEvent } from './event.mjs';
import { installModalProgress } from './modalProgress/index.mjs';
import { event, installIframeEvent } from './iframeEvent.mjs';


document.addEventListener('DOMContentLoaded', () => {
    if (self !== top) {
        const initializer = (e) => {
            const { type, payload } = e.data;

            if (type === event.INITIALIZE) {
                window.removeEventListener('message', initializer);
                const initOption = payload;
                const defaultOption = {
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
                installIframeEvent();
            }
            else {
                console.error('잘못된 요청! IFRAME이 초기화되지 않았습니다.');
            }
        };
        window.addEventListener('message', initializer);
    }
});
