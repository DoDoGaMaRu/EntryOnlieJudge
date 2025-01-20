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

let project = null;
let _tags = {};
let tagIdx = 0;


window.onload = async () => {
	await init();
	setEntUploadEvent();
	setStepEvent();
	setResetEvent();
	setRegisterEvent();
	setExitEvent();
	setInfoPageEvent();
};

const pages = [
	{
		title: '실습 정보 작성하기',
		pageIn: inInfoPage,
		pageOut: outInfoPage
	},
	{
		title: '실습 프로젝트 구성하기',
		pageIn: inProjectPage,
		pageOut: outProjectPage
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
	const response = await fetch('/rookie/js/defaultPractice.txt');
	defaultDoc = await response.text();

	if (practiceKey!==null) {
		try {
			const pracRes = await fetch(`/rookie/api/practices/${practiceKey}`);
			const { practice } = await pracRes.json();
			const { title, projectJson, outline, description, tags } = practice;
			
			$('#inputTitle').val(title);
			$('#inputOutline').val(outline);
			project = projectJson;
			postMessage(editor, editorEvent.LOAD_DOCUMENT, { document: description }, '*');
			tags.forEach(tagName => addTag(tagName));
		} catch (error) {
			await _alert(`${problemKey} 실습을 가져오는데 실패했습니다.`);
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
		const { state } = await postResponsiveMessage(entry, entryEvent.IS_RUNNING, {}, '*');
		if (state) {
			await _alert('실행중인 엔트리를 정지해주세요.');
			return;
		}
		event.preventDefault();
		const file = event.target.files[0];

		if (!file) {
			await _alert('선택된 파일이 없습니다.');
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
				console.error('Error uploading file:', error);
				await _alert('ent파일 업로드에 실패하였습니다');
			}
		});
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

		if (await _confirm("실습을 등록합니다. 진행하시겠습니까?")) {
			const title = $('#inputTitle').val().trim();
			const outline = $('#inputOutline').val().trim();
			const description = (await postResponsiveMessage(editor, editorEvent.EXPORT_DOCUMENT, {}, '*')).document;
			const tags = Object.values(_tags);
			const projectJson = project;

			const pass = 
				title === ''					? (await _alert('실습 이름을 작성해주세요.'), false):
				projectJson === null 	? (await _alert('실습 프로젝트를 작성해주세요.'), false): 
				true;

			if (pass) {
				const practice = {
					practiceKey,
					title,
					outline,
					description,
					tags,
					projectJson,
				}
				$.ajax({
					url: '/rookie/api/practices',
					method: 'POST',
					contentType: 'application/json',
					data: JSON.stringify({ practice }),
					success: async (res) => {
						await _alert('실습이 등록되었습니다!');
						window.location.href = `/rookie/teacher/practices`;
					},
					error: (xhs, status, err) => { }
				});
			}
		}
	});
}

function setExitEvent() {
	$('#btnExit').on('click', async () => {
		if (await _confirm('실습 작성(수정)을 취소하시겠습니까?')) {
			if (practiceKey) {
				window.location.href = `/rookie/practices/ws/${practiceKey}`;
			}
			else {
				window.location.href = `/rookie/teacher/practices`;
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

async function inProjectPage() {
	console.log('in')
	$('#loadEnt').removeClass('d-none');
	$('#resetEnt').removeClass('d-none');
	if (!project) {
		const { project: curProject } = await postResponsiveMessage(entry, entryEvent.EXPORT_PROJECT, {}, '*');
		project = curProject;
	}
	postMessage(entry, entryEvent.LOAD_PROJECT, { project }, '*');
}

async function outProjectPage() {
	$('#loadEnt').addClass('d-none');
	$('#resetEnt').addClass('d-none');
	const { project: curProject } = await postResponsiveMessage(entry, entryEvent.EXPORT_PROJECT, {}, '*');
	project = curProject;
}

// Page event end
