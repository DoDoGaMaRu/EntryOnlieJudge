import {
	postMessage, 
	postResponsiveMessage 
} from "./util.js";

import { event as entryEvent } from './entry/iframeEvent.mjs';
import { event as editorEvent } from './ckeditor5/iframeEvent.mjs';

let step = 0;

let ansProject = null;
let queProject = null;
let tags = {};
let tagIdx = 0;
const defaultDoc = '<figure class="table" style="width:95%;"><table class="ck-table-resized" style="background-color:hsl( 35, 100%, 80% );border:3px solid hsl( 35, 100%, 80% );"><colgroup><col style="width:100%;"></colgroup><tbody><tr><td><p>&nbsp;</p><h3 style="margin-left:40px;"><strong>설명</strong></h3><p style="margin-left:40px;">&nbsp;</p><p style="margin-left:40px;">&nbsp;</p></td></tr></tbody></table></figure><p>&nbsp;</p><figure class="table" style="width:95%;"><table class="ck-table-resized" style="background-color:hsl( 35, 100%, 80% );border:3px solid hsl( 35, 100%, 80% );"><colgroup><col style="width:100%;"></colgroup><tbody><tr><td><p style="margin-left:40px;">&nbsp;</p><h3 style="margin-left:40px;"><strong>동작 과정</strong></h3><ol><li>&nbsp;시작하기 클릭하기</li><li>&nbsp;</li></ol><p style="margin-left:40px;">&nbsp;</p></td></tr></tbody></table></figure><p>&nbsp;</p><figure class="table" style="width:95%;"><table class="ck-table-resized" style="background-color:hsl( 35, 100%, 80% );border:3px solid hsl( 35, 100%, 80% );"><colgroup><col style="width:100%;"></colgroup><tbody><tr><td><p style="margin-left:40px;"><span style="font-size:18px;"><strong>변수 설명</strong></span></p></td></tr><tr><td style="background-color:hsl(0, 0%, 100%);"><ul style="list-style-type:disc;"><li>변수 1</li></ul><p style="margin-left:40px;">설명</p><ul style="list-style-type:disc;"><li>변수 2</li></ul><p style="margin-left:40px;">설명</p></td></tr></tbody></table></figure><p>&nbsp;</p><figure class="table" style="width:95%;"><table class="ck-table-resized" style="background-color:hsl( 35, 100%, 80% );border:3px solid hsl( 35, 100%, 80% );"><colgroup><col style="width:47.3%;"><col style="width:52.7%;"></colgroup><tbody><tr><td><p style="margin-left:40px;"><span style="font-size:18px;"><strong>코딩 오브젝트</strong></span></p></td><td style="background-color:hsl(0, 0%, 100%);"><p style="text-align:center;">오브젝트 명</p></td></tr><tr><td style="background-color:hsl(0, 0%, 100%);" colspan="2"><h3 style="margin-left:40px;"><strong>지시 사항</strong></h3><ul style="list-style-type:disc;"><li>설명</li><li>&nbsp;</li></ul><p>&nbsp;</p><h3 style="margin-left:40px;"><strong>유의 사항</strong></h3><p style="margin-left:40px;">지시 사항에서 설명한 블록만 이용하십시오.</p><p style="margin-left:40px;">그렇지 않은 경우 채점 되지 않습니다.</p><p style="margin-left:40px;">지시 사항 이외의 블록을 변경하였을 경우 "<u>다시 풀기</u>" 버튼을 눌러서 초기화 후 문제를 푸시기 바랍니다.</p></td></tr></tbody></table></figure>'


const entry = document.getElementById('entry').contentWindow;
const editor = document.getElementById('editor').contentWindow;

window.onload = () => {
	init();
	setUploadEvent();
	setStepEvent();
	setRollbackEvent();
	setResetEvent();
	setSubmitEvent();
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
		delete tags[id];
		$(`#${id}`).remove();

		const tagList = $('#tagList').children()
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
	tags[id] = tagName;
}
// functions end


// Onloaded
function init() {
	// TODO 문제 수정 등 여기서 컨트롤 예정

	initResizer();
	postMessage(entry, entryEvent.INITIALIZE, {}, '*');
	postMessage(editor, editorEvent.LOAD_DOCUMENT, { document: defaultDoc }, '*');
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

	function refrashIndicator() {
		const indicators = document.getElementsByClassName('indicator');
		for (let idx = 0; idx < pages.length; idx++) {
			idx === step
				? indicators[idx].classList.add('indicator-selected')
				: indicators[idx].classList.remove('indicator-selected');
		}
	}

	refrashIndicator();
	$('#navTitle').html(pages[step].title);
	pages[step].pageIn();

	$('#btnPrev').on('click', async () => {
		if (step - 1 >= 0) {
			const last = pages[step--];
			const cur = pages[step];

			$('#navTitle').html(cur.title);
			refrashIndicator();
			await last.pageOut();
			await cur.pageIn();
		}
	});
	$('#btnNext').on('click', async () => {
		if (step + 1 < pages.length) {
			const last = pages[step++];
			const cur = pages[step];

			$('#navTitle').html(cur.title);
			refrashIndicator();
			await last.pageOut();
			await cur.pageIn();
		}
	});
}

function setUploadEvent() {
	$('#btnLoadEnt').on('click', () => { $('#fileInput').click() })
	$('#fileInput').on('change', async (event) => {
		event.preventDefault();
		const file = event.target.files[0];

		if (!file) {
			alert('select a file')
			return;
		}

		const formData = new FormData();
		formData.append('file', file);


		$.ajax({
			url: '/api/workspaces/ent',
			type: 'POST',
			data: formData,
			processData: false,
			contentType: false,
			success: (res) => {
				const { project } = res;
				postMessage(entry, entryEvent.LOAD_PROJECT, { project }, '*');
			},
			error: (xhr, status, err) => {
				console.error('Error uploading file:', error);
				alert('An error occurred while uploading the file.');
			}
		});
	});
}

function setRollbackEvent() {
	$('#btnRollbackEnt').on('click', () => {
		if (confirm("정답 프로젝트를 불러옵니다.")) {
			queProject = JSON.parse(JSON.stringify(ansProject));
			postMessage(entry, entryEvent.LOAD_PROJECT, { project: queProject }, '*');
		}
	});
}

function setResetEvent() {
	$('#btnResetEnt').on('click', () => {
		if (confirm("프로젝트를 초기화 합니다.")) {
			postMessage(entry, entryEvent.LOAD_PROJECT, { project: null }, '*');
		}
	});
}

function setSubmitEvent() {
	$('#btnSubmit').on('click', async () => {
		await pages[step].pageOut();
		await pages[step].pageIn();

		if (confirm("문제를 등록합니다. 진행하시겠습니까?")) {
			const userId = 'test';
			const title = $('#inputTitle').val();
			const level = parseInt($('#inputLevel').val());
			const description = (await postResponsiveMessage(editor, editorEvent.EXPORT_DOCUMENT, null, '*')).document;
			const categories = Object.values(tags);
			const ansProjectJson = ansProject;
			const queProjectJson = queProject;

			const pass
				= title === '' ? (alert('문제 이름을 작성해주세요.'), false)
					: isNaN(level) ? (alert('난이도를 선택해주세요.'), false)
						: ansProjectJson === null ? (alert('정답 프로젝트를 작성해주세요.'), false)
							: queProjectJson === null ? (alert('문제 프로젝트를 작성해주세요.'), false)
								: true;

			if (pass) {
				const problem = {
					userId,
					title,
					level,
					description,
					categories,
					ansProjectJson,
					queProjectJson,
				}
				$.ajax({
					url: '/api/problems',
					method: 'POST',
					contentType: 'application/json',
					data: JSON.stringify({ problem }),
					success: (res) => {
						alert('문제가 등록되었습니다!');
						// TODO
					},
					error: (xhs, status, err) => { }
				});
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
