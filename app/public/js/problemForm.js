let step = 0;

let queProject = null;
let ansProject = null;

const entry = document.getElementById('entry').contentWindow;
const editor = document.getElementById('editor').contentWindow;

const entryEvent = {
    LOAD_PROJECT: 'loadProject',
    EXPORT_PROJECT: 'exportProject',
}

const editorEvent = {
    LOAD_DOCUMENT: 'loadDocument',
    EXPORT_DOCUMENT: 'exportDocument',
}

initResizer();
window.onload = () => {
    setUploadEvent();
    setStepEvent();
    setRollbackEvent();
    setResetEvent();
    setSubmitEvent();
}



// Onloaded
function setStepEvent() {
    for (let idx=0; idx<pages.length; idx++) {
        $('.nav-indicator').append(`
            <svg class="indicator" xmlns="http://www.w3.org/2000/svg" height="100%" width="100%" viewBox="0 0 24 24" fill="#999999">
                <path d="M0 0h24v24H0z" fill="none"/>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
            </svg>
        `);
    }

    function refrashIndicator() {
        const indicators = document.getElementsByClassName('indicator');
        for (let idx=0; idx<pages.length; idx++) {
            idx === step
            ? indicators[idx].classList.add('indicator-selected')
            : indicators[idx].classList.remove('indicator-selected');
        }
    }

    refrashIndicator();
    $('#navTitle').html(pages[step].title);
    pages[step].pageIn();

    $('#btnPrev').on('click', async () => {
        if (step-1 >= 0) {
            const last = pages[step--];
            const cur = pages[step];
            
            $('#navTitle').html(cur.title);
            refrashIndicator();
            await last.pageOut();
            await cur.pageIn();
        }
    });
    $('#btnNext').on('click', async () => {
        if (step+1 < pages.length) {
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
    $('#btnLoadEnt').on('click', () => {$('#fileInput').click()})
    $('#fileInput').on('change', async (event) => {
        event.preventDefault();
        const file = event.target.files[0];

        if (!file) {
            alert('select a file')
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/workspaces', {
                method: 'POST',
                body: formData
            });
            if (res.ok) {
                const { project } = await res.json();
                postMessage(entry, entryEvent.LOAD_PROJECT, {project}, '*');
            } else {
                alert('File upload failed.');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('An error occurred while uploading the file.');
        }
    });
}

function setRollbackEvent() {
    $('#btnRollbackEnt').on('click', () => {
        if (confirm("정답 프로젝트를 불러옵니다. 진행하시겠습니까?")) {
            ansProject = JSON.parse(JSON.stringify(queProject));
            postMessage(entry, entryEvent.LOAD_PROJECT, {project: ansProject}, '*');
        }
    });
}

function setResetEvent() {
    $('#btnResetEnt').on('click', () => {
        if (confirm("프로젝트를 초기화 합니다. 진행하시겠습니까?")) {
            postMessage(entry, entryEvent.LOAD_PROJECT, {project: null}, '*');
        }
    });
}

function setSubmitEvent() {
    $('#btnSubmit').on('click', async () => {
        await pages[step].pageOut();
        await pages[step].pageIn();

        if (confirm("문제를 등록합니다. 진행하시겠습니까?")) {
            const document = await postResponsiveMessage(editor, editorEvent.EXPORT_DOCUMENT, null, '*');
            console.log(document)
        }
    });
}
// Onloaded end



// Page event
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
    if (!queProject) {
        const {project} = await postResponsiveMessage(entry, entryEvent.EXPORT_PROJECT, {}, '*');
        queProject = project;
    }
    postMessage(entry, entryEvent.LOAD_PROJECT, {project: queProject}, '*');
}

async function outAnsPage() {
    $('#loadEnt').addClass('d-none');
    $('#resetEnt').addClass('d-none');
    const {project} = await postResponsiveMessage(entry, entryEvent.EXPORT_PROJECT, {}, '*');
    queProject = project;
}

async function inQuePage() {
    $('#rollbackEnt').removeClass('d-none');
    if (!ansProject) {
        ansProject = JSON.parse(JSON.stringify(queProject));
    }
    postMessage(entry, entryEvent.LOAD_PROJECT, {project: ansProject}, '*');
}

async function outQuePage() {
    $('#rollbackEnt').addClass('d-none');
    const {project} = await postResponsiveMessage(entry, entryEvent.EXPORT_PROJECT, {}, '*');
    ansProject = project;
}
// Page event end



// Init
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
// Init end



// Iframe utils
function postMessage(dest, type, payload, origin) {
    dest.postMessage({type, payload}, origin)
}

function postResponsiveMessage(dest, type, payload, origin) {
    return new Promise((resolve) => {
        const handler = (e) => {
            // if (e.origin !== 'https://your-trusted-origin.com') return;
            const { type, payload } = e.data;
            if (type === 'response') {
                window.removeEventListener('message', handler);
                resolve(payload);
            }
        }
        window.addEventListener('message', handler);
        dest.postMessage({type, payload}, origin);
    })
}
// Iframe utils End
