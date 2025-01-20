const frameEvent = {
    'loadDocument': loadDocument,
    'exportDocument': exportDocument,
}

export const event = {
	LOAD_DOCUMENT: 'loadDocument',
	EXPORT_DOCUMENT: 'exportDocument',
}


export function installIframeEvent() {
    window.addEventListener('message', (e) => {
        // if (e.origin !== 'https://trusted-origin.com') {
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


function loadDocument(e) {
    const { payload } = e.data;
    const document = payload.document;
    window.editor.setData(document);
}

function exportDocument(e) {
    const payload = {
        document: window.editor.getData()
    }
    postMessage(e.source, 'response', payload, e.origin);
}
