import {
	postMessage, 
	postResponsiveMessage 
} from "./util.js";

import { event as entryEvent } from './entry/iframeEvent.mjs';
import { event as editorEvent } from './ckeditor5/iframeEvent.mjs';

const entry = document.getElementById('entry').contentWindow;
const editor = document.getElementById('editor').contentWindow;

let defaultDoc = null;
let step = 0;

let ansProject = null;
let queProject = null;
let _tags = {};
let tagIdx = 0;


window.onload = async () => {
	await init();
	setEntUploadEvent();
	setStepEvent();
	setRollbackEvent();
	setResetEvent();
	setRegisterEvent();
	setExitEvent();
	setInfoPageEvent();
};

const pages = [
	{
		title: '문제 정보 작성하기',
		pageIn: inInfoPage,
		pageOut: outInfoPage
	},
	{
		title: '정답 프로젝트 작성하기',
		pageIn: inAnsPage,
		pageOut: outAnsPage
	},
	{
		title: '문제 프로젝트 작성하기',
		pageIn: inQuePage,
		pageOut: outQuePage
	},
]

// functions
function addTag(tagName) {
	const removeTag = id => {
		delete _tags[id];
		$(`#${id}`).remove();

		const tagList = $('#tagList').children();
		for (let i = 0; i < tagList.length; ++i) {
			tagList[i].children[0].textContent = i + 1;
		}
	};

	const idx = $('#tagList').children().length + 1;
	const id = `tag-${++tagIdx}`

	const tr = document.createElement('tr');
	tr.id = id;

	const rmBtn = document.createElement('button');
	rmBtn.type = 'button';
	rmBtn.className = 'btn btn-secondary';
	rmBtn.textContent = '삭제';
	rmBtn.onclick = () => removeTag(id);

	const thIdx = document.createElement('th');
	const tdTag = document.createElement('td');
	const tdRmv = document.createElement('td');

	tdRmv.className = 'd-flex justify-content-center'

	thIdx.textContent = idx;
	tdTag.textContent = tagName;
	tdRmv.appendChild(rmBtn);

	tr.appendChild(thIdx);
	tr.appendChild(tdTag);
	tr.appendChild(tdRmv);

	$('#tagList').append(tr);
	_tags[id] = tagName;
}
// functions end


// Onloaded
async function init() {
	initResizer();
	postMessage(entry, entryEvent.INITIALIZE, {}, '*');
	// 기본 문서
	const response = await fetch('/rookie/js/defaultProblem.txt');
	defaultDoc = await response.text();

	// 공개/비공개 버튼 이벤트 처리
	$('#swPublicChange').on('change', async function() {
		const isPublic = $(this).is(':checked');
		$('#publicState').text(isPublic? '공개':'비공개');
	});

	if (problemKey!==null) {
		try {
			const probRes = await fetch(`/rookie/api/problems/${problemKey}`);
			const { problem } = await probRes.json();
			const { title, ansProjectJson, queProjectJson, description, tags, level, isPublic } = problem;
			
			$('#inputTitle').val(title);
			$('#inputLevel').val(level);
			$('#publicState').text(isPublic? '공개':'비공개');
			$('#swPublicChange').prop('checked', isPublic);
			ansProject = ansProjectJson;
			queProject = queProjectJson;
			postMessage(editor, editorEvent.LOAD_DOCUMENT, { document: description }, '*');
			tags.forEach(tagName => addTag(tagName));
		} catch (error) {
			await _alert(`${problemKey} 문제를 가져오는데 실패했습니다.`);
		}
	}
	else {
		postMessage(editor, editorEvent.LOAD_DOCUMENT, { document: defaultDoc }, '*');
	}
}

function initResizer() {
	const resizer = document.getElementById('resizer');
	const leftSide = resizer.previousElementSibling;
	const rightSide = resizer.nextElementSibling;
	
	let x = 0;
	let y = 0;
	
	let leftWidth = 0;
	
	const mouseDownHandler = function (e) {
			x = e.clientX;
			y = e.clientY;
			leftWidth = leftSide.getBoundingClientRect().width;
	
			document.addEventListener('mousemove', mouseMoveHandler);
			document.addEventListener('mouseup', mouseUpHandler);
	};
	
	const mouseMoveHandler = function (e) {
			const dx = e.clientX - x;
			const dy = e.clientY - y;
	
			document.body.style.cursor = 'col-resize';
	
			leftSide.style.userSelect = 'none';
			leftSide.style.pointerEvents = 'none';
	
			rightSide.style.userSelect = 'none';
			rightSide.style.pointerEvents = 'none';
	
			const newLeftWidth = ((leftWidth + dx) * 100) / resizer.parentNode.getBoundingClientRect().width;
			leftSide.style.width = `${newLeftWidth < 90 ? newLeftWidth : 100}%`;
			rightSide.style.width = `${newLeftWidth < 90 ? 99.3 - newLeftWidth : 0}%`
	};
	
	const mouseUpHandler = function () {
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

function setStepEvent() {
	for (let idx = 0; idx < pages.length; idx++) {
		$('.nav-indicator').append(`
			<svg class="indicator" xmlns="http://www.w3.org/2000/svg" height="100%" width="100%" viewBox="0 0 24 24" fill="#999999">
				<path d="M0 0h24v24H0z" fill="none"/>
				<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
			</svg>
		`);
	}

  const pageChange = async (last, cur) => {
    $('#navTitle').html(cur.title);
    const indicators = document.getElementsByClassName('indicator');
    for (let idx = 0; idx < pages.length; idx++) {
      idx === step
        ? indicators[idx].classList.add('indicator-selected')
        : indicators[idx].classList.remove('indicator-selected');
    }

    await last.pageOut();
    await cur.pageIn();
  }

  pageChange(pages[step], pages[step]);
	$('#btnPrev').on('click', async () => {
		const { state } = await postResponsiveMessage(entry, entryEvent.IS_RUNNING, {}, '*');
		if (state) {
			await _alert('실행중인 엔트리를 정지해주세요.');
			return;
		}
		if (step - 1 >= 0) {
      pageChange(pages[step--], pages[step]);
		}
	});
	$('#btnNext').on('click', async () => {
		const { state } = await postResponsiveMessage(entry, entryEvent.IS_RUNNING, {}, '*');
		if (state) {
			await _alert('실행중인 엔트리를 정지해주세요.');
			return;
		}
		if (step + 1 < pages.length) {
      pageChange(pages[step++], pages[step]);
		}
	});
}

function setEntUploadEvent() {
	$('#btnLoadEnt').on('click', () => { $('#fileInput').click() })
	$('#fileInput').on('change', async (event) => {
		event.preventDefault();
		const file = event.target.files[0];

		if (!file) {
			await _alert('파일을 선택해주세요')
			return;
		}

		const formData = new FormData();
		formData.append('file', file);


		postMessage(entry, entryEvent.OPEN_PROGRESS, {text: '업로드 중이에요.'}, '*');
		$.ajax({
			url: '/rookie/api/entry/addition/ent',
			type: 'POST',
			data: formData,
			processData: false,
			contentType: false,
			success: (res) => {
				const { project } = res;
				postMessage(entry, entryEvent.LOAD_PROJECT, { project }, '*');
				postMessage(entry, entryEvent.CLOSE_PROGRESS, {}, '*');
			},
			error: async (xhr, status, err) => {
				postMessage(entry, entryEvent.CLOSE_PROGRESS, {}, '*');
				console.error('Error uploading file:', err);
				await _alert('ent파일 업로드에 실패하였습니다');
			}
		});
	});
}

function setRollbackEvent() {
	$('#btnRollbackEnt').on('click', async () => {
		const { state } = await postResponsiveMessage(entry, entryEvent.IS_RUNNING, {}, '*');
		if (state) {
			await _alert('실행중인 엔트리를 정지해주세요.');
			return;
		}
		if (await _confirm("정답 프로젝트를 불러옵니다.")) {
			queProject = JSON.parse(JSON.stringify(ansProject));
			postMessage(entry, entryEvent.LOAD_PROJECT, { project: queProject }, '*');
		}
	});
}

function setResetEvent() {
	$('#btnResetEnt').on('click', async () => {
		const { state } = await postResponsiveMessage(entry, entryEvent.IS_RUNNING, {}, '*');
		if (state) {
			await _alert('실행중인 엔트리를 정지해주세요.');
			return;
		}
		if (await _confirm("프로젝트를 초기화 합니다.")) {
			postMessage(entry, entryEvent.LOAD_PROJECT, { project: null }, '*');
		}
	});
}

function setRegisterEvent() {
	$('#btnSubmit').on('click', async () => {
		const { state } = await postResponsiveMessage(entry, entryEvent.IS_RUNNING, {}, '*');
		if (state) {
			await _alert('실행중인 엔트리를 정지해주세요.');
			return;
		}
		await pages[step].pageOut();
		await pages[step].pageIn();

		if (await _confirm("문제를 등록(수정)합니다. 진행하시겠습니까?")) {
			const title = $('#inputTitle').val().trim();
			const level = parseInt($('#inputLevel').val());
			const description = (await postResponsiveMessage(editor, editorEvent.EXPORT_DOCUMENT, null, '*')).document;
			const tags = Object.values(_tags);
			const ansProjectJson = ansProject;
			const queProjectJson = queProject;
			const isPublic = $('#swPublicChange').is(':checked');

			const pass = 
				title === '' 							? (await _alert('문제 이름을 작성해주세요.'), false): 
				isNaN(level) 							? (await _alert('난이도를 선택해주세요.'), false):
				ansProjectJson === null 	? (await _alert('정답 프로젝트를 작성해주세요.'), false): 
				queProjectJson === null 	? (await _alert('문제 프로젝트를 작성해주세요.'), false): 
				true;

			if (pass) {
				const problem = {
					problemKey,
					title,
					level,
					description,
					tags,
					ansProjectJson,
					queProjectJson,
					isPublic,
				}

				try {
					const res = await fetch('/rookie/api/problems', {
						method: 'POST',
						headers: {'Content-Type': 'application/json'},
						body: JSON.stringify({ problem }),
					});
					if (!res.ok) {
						throw new Error(res.status);
					}
					await _alert('문제가 등록(수정)되었습니다!');
					if (problemKey) {
						window.location.href = `/rookie/problems/ws/${problemKey}`;
					}
					else {
						window.location.href = `/rookie/problems`;
					}
				} catch (error) {
					console.log(error);
					await _alert('문제 등록(수정)에 실패했습니다');
				}
			}
		}
	});
}

function setExitEvent() {
	$('#btnExit').on('click', async () => {
		if (await _confirm('문제 작성(수정)을 취소하시겠습니까?')) {
			if (problemKey) {
				window.location.href = `/rookie/problems/ws/${problemKey}`;
			}
			else {
				window.location.href = `/rookie/problems`;
			}
		}
	});
}

function setInfoPageEvent() {
	$('#btnAddTag').on('click', () => {
		const tagName = $('#inputAddTag').val();
		if (tagName === '') return;
		$('#inputAddTag').val("");

		addTag(tagName);
	});
}
// Onloaded end



// Page event
async function inInfoPage() {
	$('#entry').addClass('d-none');
	$('#infoEditor').removeClass('d-none');
}

async function outInfoPage() {
	$('#entry').removeClass('d-none');
	$('#infoEditor').addClass('d-none');
}

async function inAnsPage() {
	$('#loadEnt').removeClass('d-none');
	$('#resetEnt').removeClass('d-none');
	if (!ansProject) {
		const { project } = await postResponsiveMessage(entry, entryEvent.EXPORT_PROJECT, {}, '*');
		ansProject = project;
	}
	postMessage(entry, entryEvent.LOAD_PROJECT, { project: ansProject }, '*');
}

async function outAnsPage() {
	$('#loadEnt').addClass('d-none');
	$('#resetEnt').addClass('d-none');
	const { project } = await postResponsiveMessage(entry, entryEvent.EXPORT_PROJECT, {}, '*');
	ansProject = project;
}

async function inQuePage() {
	$('#loadEnt').removeClass('d-none');
	$('#rollbackEnt').removeClass('d-none');
	if (!queProject) {
		queProject = JSON.parse(JSON.stringify(ansProject));
	}
	postMessage(entry, entryEvent.LOAD_PROJECT, { project: queProject }, '*');
}

async function outQuePage() {
	$('#loadEnt').addClass('d-none');
	$('#rollbackEnt').addClass('d-none');
	const { project } = await postResponsiveMessage(entry, entryEvent.EXPORT_PROJECT, {}, '*');
	queProject = project;
}
// Page event end
