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
const clearSvg = `
		<svg class="mt-1" xmlns="http://www.w3.org/2000/svg" height="1rem" width="1rem" viewBox="0 0 24 24" fill="#29c45c">
			<path d="M12 2C6.47 3 3 6.47 3 12s4.47 9 9 9 9-4.47 9-9S17.53 3 12 2z" fill="#EFEFEF"/>
			<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
		</svg>
	`;


window.onload = async () => {
	await init();
	setResetEvent();
	setSaveEvent();
	setSubmitEvent();
	setModifyEvent();
	setDeleteEvent();
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
		const probRes = await fetch(`/api/problems/${problemKey}`);
		const { problem, clear } = await probRes.json();
		const { title, queProjectJson, description } = problem;
		
		const wsRes = await fetch(`/api/workspaces/solution/${problemKey}`);
		const { workspace } = await wsRes.json();

		queProject = queProjectJson;
		const project = workspace? workspace.projectJson:queProjectJson;

		$('#navTitle').html(title);
		if (clear) $('#navTitle').after(clearSvg);

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
			leftSide.style.width = `${newLeftWidth<5 ? 0:newLeftWidth}%`;
			rightSide.style.width = `${newLeftWidth<5 ? 100:99.3-newLeftWidth}%`;
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
				success: (res) => {  },
				error: (xhs, status, err) => {  }
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
				const {ans, dest, clear} = await res.json();
				if (clear) {
					alert('정답입니다!');
			    window.location.href = '/problems';
				}
				else {
					alert('오답입니다!');
					console.log({ans, dest, clear});
				}
			} catch (error) {
				console.log(error)
			}
		}
	});
}

function setModifyEvent() {
	$('#btnModify').on('click', () => {
		if (confirm('문제를 수정하시겠습니까?')) {
			window.location.href = `/problems/modify/${problemKey}`;
		}
	});
}

function setDeleteEvent() {
	$('#btnDelete').on('click', async () => {
		if (confirm('정말 문제를 삭제하시겠습니까?')) {
			try {
				await fetch(`/api/problems/${problemKey}`, {method: 'DELETE'});
				alert(`${problemKey}번 문제가 삭제되었습니다`);
				window.location.href = `/problems`;
			} catch (error) {
				alert(`${problemKey}번 문제의 삭제에 실패했습니다`);
			}
		}
	});
}

function setExitEvent() {
	$('#btnExit').on('click', async () => {
		if (confirm('저장하지 않은 변경사항은 사라집니다. 계속하시겠습니까?')) {
			window.location.href = `/problems`;
		}
	});
}
// Onloaded end