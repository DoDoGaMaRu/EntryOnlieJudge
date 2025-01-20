import { closeModalProgress, openModalProgress } from './modalProgress/index.mjs';

export const event = {
    INITIALIZE: 'initialize',
	LOAD_PROJECT: 'loadProject',
	EXPORT_PROJECT: 'exportProject',
    CAPTURE_CANVAS: 'captureCanvas',
    IS_RUNNING: 'isRunning',
    OPEN_PROGRESS: 'openProgress',
    CLOSE_PROGRESS: 'closeProgress',
}

const frameEvent = {
    'loadProject': loadProject,
    'exportProject': exportProject,
    'isRunning': isRunning,
    'captureCanvas': captureCanvas,
    'openProgress': openProgress,
    'closeProgress': closeProgress,
}

export function installIframeEvent() {
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

function isRunning(e) {
    const payload = {
        state: Entry.running
    }
    postMessage(e.source, 'response', payload, e.origin);
}

function captureCanvas(e) {
    const payload = {
        image: Entry.canvas_.toDataURL(),
        file: {name: 'capture.png'},
    }
    postMessage(e.source, 'response', payload, e.origin);
}

function openProgress(e) {
    const { payload } = e.data;
    const { text } = payload;
    openModalProgress(text);
}

function closeProgress(e) {
    closeModalProgress();
}