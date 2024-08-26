import { 
	postMessage,
	postResponsiveMessage
} from './util.js'

import { event as entryEvent } from './entry/iframeEvent.mjs';
import { event as viewerEvent } from './viewer/iframeEvent.mjs';

let viewerClosed = true;
let queProject = null;
const entry = document.getElementById('entry').contentWindow;
const viewer = document.getElementById('viewer').contentWindow;

window.onload = async () => {
	await init();
	setResetEvent();
	setSaveEvent();
	setSubmitEvent();
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
		const probRes = await fetch(`/api/problems/${problemKey}`);
		const { problem } = await probRes.json();
		const { title, queProjectJson, description } = problem;
		
		const wsRes = await fetch(`/api/workspaces/solution/${problemKey}`);
		const { workspace } = await wsRes.json();

		queProject = queProjectJson;
		const project = workspace? workspace.projectJson:queProjectJson;

		$('#navTitle').html(title);
		postMessage(entry, entryEvent.INITIALIZE, entryOption, '*');
		postMessage(entry, entryEvent.LOAD_PROJECT, {project: project}, '*');
		postMessage(viewer, viewerEvent.LOAD_DOCUMENT, {document: description}, '*');
	} catch (error) {
		alert(`${problemKey} 문제를 가져오는데 실패했습니다.`);
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
			leftSide.style.width = `${newLeftWidth < 5 ? 0:newLeftWidth}%`;
			rightSide.style.width = `${newLeftWidth < 5 ? 100:99.3-newLeftWidth}%`;
			// viewerClosed = newLeftWidth < 5;
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

	// const shortcutHander = (e) => {
	// 	if (e.shiftKey && e.code === 'Space') {
	// 		e.preventDefault();
	// 		viewerClosed = !viewerClosed;
	// 		leftSide.style.width = viewerClosed? '0%':'100%';
	// 		rightSide.style.width = viewerClosed? '100%':'0%';
	// 	}
	// } 
	//
	// document.addEventListener('keydown', shortcutHander);
	resizer.addEventListener('mousedown', mouseDownHandler);
}

function setResetEvent() {
	$('#btnReset').on('click', () => {
		if (confirm('프로젝트를 초기화 합니다.')) {
			postMessage(entry, entryEvent.LOAD_PROJECT, {project: queProject}, '*');
		}
	});
}

function setSaveEvent() {
	$('#btnSave').on('click', async () => {
		if (confirm('프로젝트를 저장합니다.')) {
			const { project } = await postResponsiveMessage(entry, entryEvent.EXPORT_PROJECT, {}, '*');
			$.ajax({
				url: '/api/workspaces/solution',
				type: 'POST',
				contentType: 'application/json',
				data: JSON.stringify({ problemKey, project }),
				success: (res) => {},
				error: (xhs, status, err) => { }
			});
		}
	});
}

function setSubmitEvent() {
	$('#btnSubmit').on('click', async () => {
		if (confirm('제출하시겠습니까?')) {
			const { project } = await postResponsiveMessage(entry, entryEvent.EXPORT_PROJECT, {}, '*');

			try {
				const res = await fetch(`/api/problems/submit`, {
					method: 'POST',
					headers: {'Content-Type': 'application/json'},
					body: JSON.stringify({ problemKey, project })
				});
				const {ans, dest, success} = await res.json();
				alert(success);
				console.log({ans, dest, success});
			} catch (error) {
				console.log(error)
			}
		}
	});
}
// Onloaded end