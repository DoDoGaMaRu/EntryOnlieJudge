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
const clearIcon = `
	<svg xmlns="http://www.w3.org/2000/svg" height="1.2rem" width="1.2rem" viewBox="0 0 24 24" fill="#29c45c" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="성공한 문제에요!">
		<path d="M12 2C6.47 3 3 6.47 3 12s4.47 9 9 9 9-4.47 9-9S17.53 3 12 2z" fill="#EFEFEF"/>
		<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
	</svg>
`;
const failIcon = `
	<svg xmlns="http://www.w3.org/2000/svg" height="1.2rem" width="1.2rem" viewBox="0 0 24 24" fill="#fd9f28" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="이 문제를 시도했지만, 아직 성공하지 못했어요!">
		<path d="M12 2C6.47 3 3 6.47 3 12s4.47 9 9 9 9-4.47 9-9S17.53 3 12 2z" fill="#EFEFEF"/>
		<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
	</svg>
`;


window.onload = async () => {
	await init();
	setResetEvent();
	setSaveEvent();
	setSubmitEvent();
	setModifyEvent();
	setDeleteEvent();
	setSolutionsEvent();
	setExitEvent();
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
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
		const urlParams = new URLSearchParams(window.location.search);
		const solutionKey = urlParams.get('solutionKey');
		const probRes = await fetch(`/rookie/api/problems/${problemKey}`);
		const { problem, clear } = await probRes.json();
		const { title, queProjectJson, description } = problem;
		let tempProjectJson = null;

		if (solutionKey) {
			const solRes = await fetch(`/rookie/api/solutions/${solutionKey}`);
			const { solution } = await solRes.json();
			tempProjectJson = solution.projectJson;
		}
		else {
			const wsRes = await fetch(`/rookie/api/problems/ws/${problemKey}`);
			const { workspace } = await wsRes.json();
			if (workspace) {
				tempProjectJson = workspace.projectJson;
			}
		}

		queProject = queProjectJson;
		const project = tempProjectJson?? queProjectJson;

		$('#navTitle').html(title);
		if (clear !== null) {
			$('#navIcon').html(clear? clearIcon:failIcon);
		}
		$('#navTitle').before(`
			<div class="lv-${problem.level} mx-1 no-drag" style="font-weight: 600; padding: 0 0.3rem; font-size: 0.85rem; background-color: #FEFEFE; border-radius: 0.5rem">
				lv.${problem.level}
			<div>
		`);

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
		console.log(error);
		await _alert(`${problemKey}번 문제를 가져오는데 실패했습니다.`);
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
			postMessage(entry, entryEvent.LOAD_PROJECT, {project: queProject}, '*');
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
			const res = await fetch(`/rookie/api/problems/ws/${problemKey}`, {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({ problemKey, projectJson })
			})
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

function setSubmitEvent() {
	$('#btnSubmit').on('click', async () => {
		const { state } = await postResponsiveMessage(entry, entryEvent.IS_RUNNING, {}, '*');
		if (state) {
			await _alert('실행중인 엔트리를 정지해주세요.');
			return;
		}
		if (await _confirm('제출하시겠습니까?')) {
			const { project: projectJson } = await postResponsiveMessage(entry, entryEvent.EXPORT_PROJECT, {}, '*');

			try {
				const res = await fetch(`/rookie/api/solutions/submit`, {
					method: 'POST',
					headers: {'Content-Type': 'application/json'},
					body: JSON.stringify({ problemKey, projectJson })
				});
				if (!res.ok) {
					throw new Error(res.status);
				}

				const {clear} = await res.json();
				await _progress('채점 중', clear);

				if (clear) {
					$("#startButton").trigger("click");
					setTimeout(()=>{$("#stopButton").trigger("click");}, 2000);
					$('#navIcon').html(clearIcon);
					await _alert('정답입니다!');
				}
				else {
					if (!$('#navIcon').children().length) {
						$('#navIcon').html(failIcon);
					}
					await _alert('오답입니다!');
				}
				
			} catch (error) {
				await _alert('채점 중 오류가 발생했습니다');
				console.log(error)
			}
		}
	});
}

function setModifyEvent() {
	$('#btnModify').on('click', async () => {
		window.location.href = `/rookie/problems/modify/${problemKey}`;
	});
}

function setDeleteEvent() {
	$('#btnDelete').on('click', async () => {
		if (await _confirm('정말 문제를 삭제하시겠습니까?')) {
			try {
				await fetch(`/rookie/api/problems/${problemKey}`, {method: 'DELETE'});
				await _alert(`${problemKey}번 문제가 삭제되었습니다`);
				window.removeEventListener('beforeunload', handleBeforeUnload);
				window.location.href = `/rookie/problems`;
			} catch (error) {
				await _alert(`${problemKey}번 문제의 삭제에 실패했습니다`);
			}
		}
	});
}

function setSolutionsEvent() {
	$('#btnSolutions').on('click', async () => {
		const params = new URLSearchParams();
		params.append('problemKey', problemKey);

		window.location.href = `/rookie/solutions?${params.toString()}`;
	})
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