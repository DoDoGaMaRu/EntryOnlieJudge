import {
	postMessage, 
	postResponsiveMessage 
} from "./util.js";

import { event as entryEvent } from './entry/iframeEvent.mjs';
import { event as editorEvent } from './ckeditor5/iframeEvent.mjs';

const entry = document.getElementById('entry').contentWindow;

let step = 0;

let project = null;
let _tags = {};
let tagIdx = 0;


window.onload = async () => {
	await init();
	setUploadEvent();
	setStepEvent();
	setResetEvent();
	setSubmitEvent();
	setExitEvent();
	setInfoPageEvent();
};

const pages = [
	{
		title: '교안 정보 작성하기',
		pageIn: inInfoPage,
		pageOut: outInfoPage
	},
	{
		title: '교안 프로젝트 구성하기',
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
	postMessage(entry, entryEvent.INITIALIZE, {}, '*');
	if (practiceKey!==null) {
		try {
			const pracRes = await fetch(`/api/practices/${practiceKey}`);
			const { problem } = await pracRes.json();
			const { title, projectJson, description, tags } = problem;
			
			$('#inputTitle').val(title);
			$('#inputDescriptinon').val(description);
			project = projectJson;
			
			tags.forEach(tagName => addTag(tagName));
		} catch (error) {
			alert(`${problemKey} 교안을 가져오는데 실패했습니다.`);
		}
	}
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
		if (step - 1 >= 0) {
      pageChange(pages[step--], pages[step]);
		}
	});
	$('#btnNext').on('click', async () => {
		if (step + 1 < pages.length) {
      pageChange(pages[step++], pages[step]);
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

		if (confirm("교안을 등록합니다. 진행하시겠습니까?")) {
			const title = $('#inputTitle').val();
			const description = $('#inputDescriptinon').val();
			const tags = Object.values(_tags);
			const projectJson = project;

			const pass = 
				title.trim() === ''				? (alert('교안 이름을 작성해주세요.'), false):
				description.trim() === '' ? (alert('교안 설명을 작성해주세요.'), false):
				projectJson === null 			? (alert('교안 프로젝트를 작성해주세요.'), false): 
				true;

			if (pass) {
				const practice = {
					practiceKey,
					title,
					description,
					tags,
					projectJson,
				}
				console.log(practice);
				// $.ajax({
				// 	url: '/api/problems',
				// 	method: 'POST',
				// 	contentType: 'application/json',
				// 	data: JSON.stringify({ problem }),
				// 	success: (res) => {
				// 		alert('교안이 등록되었습니다!');
				// 		window.location.href = `/problems`;
				// 	},
				// 	error: (xhs, status, err) => { }
				// });
			}
		}
	});
}

function setExitEvent() {
	$('#btnExit').on('click', () => {
		if (confirm('교안 작성(수정)을 취소하시겠습니까?')) {
			window.location.href = `/problems`;
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
