var listTool;
export function installListTool() {
    const container = document.getElementById('EntryListContainer');
    listTool = new EntryTool.ListTool({
        container,
        isShow: false,
        theme: 'entry',
        data: {},
    });
    return listTool;
}

function setListToolEvent(name) {
    listTool.on('hide', () => {
        listTool.removeAllListeners();
    });
    listTool.on('save', (data) => {
        if (data.length === 1 && data[0] === '') {
            EntryModal.alert('불러오기 할 항목이 없습니다');
        } else {
            const list = Entry.variableContainer.selected;
            list.array_ = data.map((element) => ({ data: element }));
            Entry.do('listChangeLength', list.id_, list.array_.length);
        }
    });
    listTool.on('copy', () => {
        EntryModal.alert('내용이 복사되었습니다');
    });
    listTool.on('download', (list) => {
        // list 파라미터를 기반으로 다운로드를 구성한다.(API 서버 영역)
        console.log('download');
    });
    listTool.on('convertTable', (lists) => {
        const beforeData = lists.map((list) => {
            return list.split(',');
        });
        // INFO: 가장 길이가 긴 행을 기준으로, 이보다 짧은 행은 빈 문자열을 넣어준다.
        const maxRowLength = _.max(beforeData.map((row) => row.length));
        const validData = beforeData.map((row) => {
            return row.length < maxRowLength
                ? row.concat(Array(maxRowLength - row.length).fill(''))
                : row;
        });

        const tableInfo = {
            name,
            fields: validData[0],
            data: validData.slice(1),
            chart: [],
            lang: 'ko',
            url: '',
            rows: lists.length,
            fieldInfos: [],
            provider: 'list_provider',
            summary: 'list_summary',
            description: 'list_description',
            exampleurl: null,
            linkText: '',
            isOpen: true,
            updated: new Date(),
            hasOtherTypes: false,
            otherTypes: [],
        };
        Entry.playground.dataTable.addSources([tableInfo]);
        listTool.hide();
        Entry.creationChangedEvent.notify();
    });
}

export function openImportListModal(data) {
    setListToolEvent();
    listTool.show({ type: 'import' }, { data });
}

export function openExportListModal(data, name) {
    setListToolEvent(name);
    listTool.show({ type: 'export' }, { data });
}
