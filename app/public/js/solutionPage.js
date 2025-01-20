import { 
	postMessage,
	postResponsiveMessage
} from './util.js'

import { event as entryEvent } from './entry/iframeEvent.mjs';
import { event as viewerEvent } from './viewer/iframeEvent.mjs';


const entry = document.getElementById('entry').contentWindow;
const viewer = document.getElementById('viewer').contentWindow;
const clearIcon = `
	<svg class="ms-1" xmlns="http://www.w3.org/2000/svg" height="1.2rem" width="1.2rem" viewBox="0 0 24 24" fill="#29c45c">
		<path d="M12 2C6.47 3 3 6.47 3 12s4.47 9 9 9 9-4.47 9-9S17.53 3 12 2z" fill="#EFEFEF"/>
		<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
	</svg>
`;
const failIcon = `
<svg class="ms-1" xmlns="http://www.w3.org/2000/svg" height="1.2rem" width="1.2rem" viewBox="0 0 24 24" fill="#fd9f28">
	<path d="M12 2C6.47 3 3 6.47 3 12s4.47 9 9 9 9-4.47 9-9S17.53 3 12 2z" fill="#EFEFEF"/>
	<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
</svg>
`;

window.onload = async () => {
	await init();
	setExitEvent();

};


// Onloaded
async function init() {
	initResizer();

	const entryOption = {
		objectEditable: false,
		soundeditable: false,
		pictureeditable: false,
		sceneEditable: false,
		hardwareEnable: false,
		expansionDisable: false,
		aiUtilizeDisable: false,
	}

	try {
		const solRes = await fetch(`/rookie/api/solutions/${solutionKey}`);
		const { solution } = await solRes.json();
		const { ownerId, problemKey, projectJson, clear } = solution;
    
		const probRes = await fetch(`/rookie/api/problems/${problemKey}`);
		const { problem } = await probRes.json();
		const { title, queProjectJson, description } = problem;

		$('#navTitle').html(`${solutionKey}번 제출 - ${title}`);
		if (clear !== null) {
			$('#navTitle').after(clear? clearIcon:failIcon);
		}

		postMessage(entry, entryEvent.INITIALIZE, entryOption, '*');
		postMessage(entry, entryEvent.LOAD_PROJECT, {project: projectJson}, '*');
		postMessage(viewer, viewerEvent.LOAD_DOCUMENT, {document: description}, '*');
	} catch (error) {
    console.log(error);
		await _alert(`${solutionKey}번 솔루션을 가져오는데 실패했습니다.`);
		window.close();
	}
}


function initResizer() {
	const resizer = document.getElementById('resizer');
	const leftSide = resizer.previousElementSibling;
	const rightSide = resizer.nextElementSibling;
	
	let x = 0;
	let y = 0;
	
	let leftWidth = 0;
	
	const mouseDownHandler = (e) => {
			x = e.clientX;
			y = e.clientY;
			leftWidth = leftSide.getBoundingClientRect().width;
	
			document.addEventListener('mousemove', mouseMoveHandler);
			document.addEventListener('mouseup', mouseUpHandler);
	};
	
	const mouseMoveHandler = (e) => {
			const dx = e.clientX - x;
			const dy = e.clientY - y;
	
			document.body.style.cursor = 'col-resize';
	
			leftSide.style.userSelect = 'none';
			leftSide.style.pointerEvents = 'none';
	
			rightSide.style.userSelect = 'none';
			rightSide.style.pointerEvents = 'none';
	
			const newLeftWidth = ((leftWidth + dx) * 100) / resizer.parentNode.getBoundingClientRect().width;
			leftSide.style.width = `${newLeftWidth<5 ? 0:newLeftWidth}%`;
			rightSide.style.width = `${newLeftWidth<5 ? 100:99.3-newLeftWidth}%`;
	};
	
	const mouseUpHandler = () => {
			document.body.style.removeProperty('cursor');
	
			leftSide.style.removeProperty('user-select');
			leftSide.style.removeProperty('pointer-events');
			rightSide.style.removeProperty('user-select');
			rightSide.style.removeProperty('pointer-events');
	
			document.removeEventListener('mousemove', mouseMoveHandler);
			document.removeEventListener('mouseup', mouseUpHandler);
	};

	resizer.addEventListener('mousedown', mouseDownHandler);
}

function setExitEvent() {
	$('#btnExit').on('click', async () => {
		window.close();
	});
}
// Onloaded end