
const frameEvent = {
	'loadDocument': loadDocument,
}

export const event = {
	LOAD_DOCUMENT: 'loadDocument',
}


export function installIframeEvent() {
	window.addEventListener('message', (e) => {
		const { type } = e.data;
		if (type && frameEvent[type]) {
			frameEvent[type](e);
		} else {
			console.warn('Unknown message type:', type);
		}
	});
}

function loadDocument(e) {
	const { payload } = e.data;
	const doc = payload.document;
	const docContainer = document.getElementById('documentContainer')
	docContainer.innerHTML = doc;
}
