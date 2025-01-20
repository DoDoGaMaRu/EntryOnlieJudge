import { 
	postMessage,
	postResponsiveMessage
} from './util.js'

import { event as entryEvent } from './entry/iframeEvent.mjs';
import { event as viewerEvent } from './viewer/iframeEvent.mjs';


let defaultProject = null;
const entry = document.getElementById('entry').contentWindow;
const viewer = document.getElementById('viewer').contentWindow;


window.onload = async () => {
	await init();
	setResetEvent();
	setSaveEvent();
	setModifyEvent();
	setDeleteEvent();
	setExitEvent();
	
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
};

// Onloaded
async function init() {
	initResizer();

	const entryOption = {
		// objectEditable: false,
		// soundeditable: false,
		// pictureeditable: false,
		// sceneEditable: false,
		// hardwareEnable: false,
		// expansionDisable: false,
		// aiUtilizeDisable: false,
	}

	try {
		const probRes = await fetch(`/rookie/api/practices/${practiceKey}`);
		const { practice } = await probRes.json();
		const { title, projectJson, outline, description } = practice;
		

		const urlParams = new URLSearchParams(window.location.search);
		const userId = urlParams.get('userId');
		let tempProjectJson = null;
		if (userId) {
			const wsRes = await fetch(`/rookie/api/practices/ws/${practiceKey}/${userId}`);
			const { workspace } = await wsRes.json();
			if (workspace) {
				tempProjectJson = workspace.projectJson;
			}
		}
		else {
			const wsRes = await fetch(`/rookie/api/practices/ws/${practiceKey}`);
			const { workspace } = await wsRes.json();
			if (workspace) {
				tempProjectJson = workspace.projectJson;
			}
		}

		defaultProject = projectJson;
		const project = tempProjectJson?? projectJson;

		$('#navTitle').html(title);

		// 문서 새 창으로
		$('#docBtn').on('click', async () => {
			const docWindow = window.open(
				`/rookie/component/documentViewer`, 
				Math.random().toString(36).substring(2, 2 + 10), 
				`width=700, height=${window.innerHeight}, left=0, top=0`
			);
			docWindow.onload = () => {
				postMessage(docWindow, viewerEvent.LOAD_DOCUMENT, {document: description}, '*');
			}
		});

		postMessage(entry, entryEvent.INITIALIZE, entryOption, '*');
		postMessage(entry, entryEvent.LOAD_PROJECT, {project: project}, '*');
		postMessage(viewer, viewerEvent.LOAD_DOCUMENT, {document: description}, '*');

	} catch (error) {
		console.log(error)
		await _alert(`${practiceKey}번 실습을 가져오는데 실패했습니다.`);
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

			leftSide.style.width = newLeftWidth<5 ? `12px`:`${newLeftWidth}%`;
			rightSide.style.width = newLeftWidth<5 ? `100%`:`${99.3-newLeftWidth}%`;
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
	$('#btnReset').on('click', async () => {
		const { state } = await postResponsiveMessage(entry, entryEvent.IS_RUNNING, {}, '*');
		if (state) {
			await _alert('실행중인 엔트리를 정지해주세요.');
			return;
		}
		if (await _confirm('프로젝트를 초기화 합니다.')) {
			postMessage(entry, entryEvent.LOAD_PROJECT, {project: defaultProject}, '*');
		}
	});
}

function setSaveEvent() {
	$('#btnSave').on('click', async () => {
		const { state } = await postResponsiveMessage(entry, entryEvent.IS_RUNNING, {}, '*');
		if (state) {
			await _alert('실행중인 엔트리를 정지해주세요.');
			return;
		}

		const { project: projectJson } = await postResponsiveMessage(entry, entryEvent.EXPORT_PROJECT, {}, '*');
		try {
			const res = await fetch(`/rookie/api/practices/ws/${practiceKey}`, {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({ projectJson })
			});
			if (!res.ok) {
				throw new Error(res.status);
			}
			await _alert('프로젝트가 저장되었습니다.');
		} catch (error) {
			console.error(error);
			await _alert('프로젝트 저장에 실패했습니다.');
		}
	});
}

function setModifyEvent() {
	$('#btnModify').on('click', () => {
		window.location.href = `/rookie/teacher/practices/modify/${practiceKey}`;
	});
}

function setDeleteEvent() {
	$('#btnDelete').on('click', async () => {
		if (await _confirm('정말 실습을 삭제하시겠습니까?')) {
			try {
				await fetch(`/rookie/api/practices/${practiceKey}`, {method: 'DELETE'});
				await _alert(`${practiceKey}번 실습이 삭제되었습니다`);
				window.removeEventListener('beforeunload', handleBeforeUnload);
				window.close();
			} catch (error) {
				await _alert(`${practiceKey}번 실습의 삭제에 실패했습니다`);
			}
		}
	});
}

function setExitEvent() {
	$('#btnExit').on('click', async () => {
		window.close();
	});
	window.addEventListener('beforeunload', handleBeforeUnload);
}
// Onloaded end

function handleBeforeUnload(event) {
	event.preventDefault();

	event.returnValue = '';
	return '';
}