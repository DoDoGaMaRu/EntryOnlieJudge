import { 
	postMessage,
	postResponsiveMessage
} from './util.js'

import { event as entryEvent } from './entry/iframeEvent.mjs';


const entry = document.getElementById('entry').contentWindow;

window.onload = async () => {
	await init();
	setExitEvent();
	setEntUploadEvent();
	setSaveEvent();
}

/**
 * 필요한 기능
 * 
 * [완료] 뒤로가기         - 저장 여부 확인해야함
 * [완료] 엔트리 불러오기  - 외부에서 만든 엔트리 프로젝트 불러오기 가능
 * [완료] 저장하기         - 현재 상태를 저장하기
 * 공개상태 변경    - 필요할까?
 * 공유하기         - 필요할까?
 * 
 */

// Onloaded
async function init() {

	const entryOption = {
		volatileUpload: true,
		// objectEditable: false,
		// soundeditable: false,
		// pictureeditable: false,
		// sceneEditable: false,
		// hardwareEnable: false,
		// expansionDisable: false,
		// aiUtilizeDisable: false,
	}
	let project = null;
	if (workspaceOid) {
		try {
			const res = await fetch(`/rookie/api/workspaces/${workspaceOid}`);
			if (!res.ok) {
				throw new Error(res.status);
			}
			const { workspace } = await res.json();
			$('#inputTitle').val(workspace.title);
			project = workspace.projectJson;
		} catch (error) {
			console.error(error);
			await _alert('작품 불러오기에 실패했어요');
			window.close();
		}
	}

  postMessage(entry, entryEvent.INITIALIZE, entryOption, '*');
  postMessage(entry, entryEvent.LOAD_PROJECT, { project }, '*');
}

function setSaveEvent() {
	$('#btnSave').on('click', async () => {
		const { state } = await postResponsiveMessage(entry, entryEvent.IS_RUNNING, {}, '*');
		if (state) {
			await _alert('실행중인 엔트리를 정지해주세요.')
			return;
		}

		
		const title = $('#inputTitle').val().trim();
		const { project: projectJson } = await postResponsiveMessage(entry, entryEvent.EXPORT_PROJECT, {}, '*');
		const { image, file } = await postResponsiveMessage(entry, entryEvent.CAPTURE_CANVAS, {}, '*')
		const pass = 
			title===''			? (await _alert('작품 이름을 작성해주세요.'), false):
			title.length>24	? (await _alert('작품 이름은 24글자를 넘길수 없어요.'), false):true;

		if (pass) {
			const workspace = {
				workspaceOid, title, projectJson
			}
			try {
				const res = await fetch(`/rookie/api/workspaces`, {
					method: 'POST',
					headers: {'Content-Type': 'application/json'},
					body: JSON.stringify({ workspace, image, file })
				});
				if (!res.ok) {
					throw new Error(res.status);
				}
				await _alert('작품이 저장되었어요!');
				const { workspace: ws } = await res.json();
				if (ws._id) {
					window.removeEventListener('beforeunload', handleBeforeUnload);
					window.location.href = `/rookie/workspace/${ws._id}`;
				}
			} catch (error) {
				console.error(error);
				await _alert('작품 저장에 실패했어요');
			}
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
			await _alert('select a file')
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