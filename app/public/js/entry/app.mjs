import { installPopup } from './popup/index.mjs';
import { installListTool } from './listTool/index.mjs';
import { installEntryEvent } from './event.mjs';
import { installModalProgress } from './modalProgress/index.mjs';


document.addEventListener('DOMContentLoaded', () => {
    var initOption = {
        // 서비스하시는 상대/절대 경로로 지정해주세요.
        libDir: '',
        type: 'workspace',
        baseUrl: '/',
        textCodingEnable: true,
        backpackDisable: true,
        exportObjectEnable: true,
        blockSaveImageEnable: false,
        iframeDomAccess: 'none', //direct, message, 6none
    };
    Entry.creationChangedEvent = new Entry.Event(window);
    Entry.init(document.getElementById('workspace'), initOption);
    installPopup();
    installModalProgress();
    installListTool();
    installEntryEvent();

    // const projectData = document.getElementById("projectData");
    // const project = JSON.parse(projectData.value);
    // projectData.parentNode.removeChild(projectData);
    // Entry.loadProject(project);
    
    Entry.loadProject();
});


