export const event = {
    INITIALIZE: 'initialize',
	LOAD_PROJECT: 'loadProject',
	EXPORT_PROJECT: 'exportProject',
}

export function initIframe(initCallback) {
    const initializer = (e) => {
        const { type, payload } = e.data;
        if (type === event.INITIALIZE) {
            window.removeEventListener('message', initializer);
            initCallback(payload);
            installIframeEvent();
        }
        else {
            console.error('잘못된 요청! IFRAME이 초기화되지 않았습니다.');
        }
    };
    window.addEventListener('message', initializer);
}


const frameEvent = {
    'loadProject': loadProject,
    'exportProject': exportProject,
}

function installIframeEvent() {
    window.addEventListener('message', (e) => {
        // if (e.origin !== 'https://your-trusted-origin.com') {
        //     console.warn('Untrusted origin:', e.origin);
        //     return;
        // }

        const { type } = e.data;
        if (type && frameEvent[type]) {
            frameEvent[type](e);
        } else {
            console.warn('Unknown message type:', type);
        }
    });
}

function postMessage(dest, type, payload, origin) {
    dest.postMessage({type, payload}, origin)
}

function loadProject(e) {
    const { payload } = e.data;
    const project = payload.project;
    Entry.clearProject();
    Entry.loadProject(project);
}

function exportProject(e) {
    const payload = {
        project: Entry.exportProject()
    }
    postMessage(e.source, 'response', payload, e.origin);
}
