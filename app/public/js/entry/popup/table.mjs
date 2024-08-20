import { uploadFail, failAlert } from './index.mjs';
import { fetchWithBaseUrl, fetchUploadWithBaseUrl } from '../util/index.mjs';

async function addTables(tables = []) {
    const tableInfos = await Promise.all(
        tables.map(async ({ projectTable, selected, ...infos } = {}) => {
            let { data: origin, fields } = projectTable;
            const max = _.max([fields.length, ..._.map(origin, (row) => row.length)]);
            fields = _.concat(fields, new Array(max - fields.length).fill(''));
            origin = _.map(origin, (row) => _.concat(row, new Array(max - row.length).fill('')));
            return { ...projectTable, ...infos, fields, data: origin };
        })
    );
    Entry.playground.dataTable.addSources(tableInfos);
    Entry.creationChangedEvent.notify();
}

export function setTablePopupEvent(popup) {
    popup.on('fetch', async (category) => {
        const data = await fetchWithBaseUrl(`/api/entry/table`);
        popup.setData({ data: { data } });
    });
    popup.on('search', async ({ searchQuery }) => {
        const data = (searchQuery.trim() === '')
            ? await fetchWithBaseUrl(`/api/entry/table`)
            : await fetchWithBaseUrl(`/api/entry/table/search?query=${searchQuery}`)
        popup.setData({ data: { data } });
    });
    popup.on('submit', (data) => {
        const { selected = [] } = data || [];
        addTables(
            selected.map(({ id, ...others }) => ({
                _id: id,
                ...others,
            }))
        );
        Entry.creationChangedEvent?.notify();
    });
    popup.on('dummyUploads', async ({ formData }) => {
        const data = await fetchUploadWithBaseUrl(`/api/entry/table`, {
            method: 'post',
            body: formData,
        });

        // TODO 만약 데이터를 DB에서 관리한다면 백엔드에서 _id까지 주는 것이 맞음
        const uploads = data.uploads.map(upload => {
            upload['_id'] = Entry.generateHash();
            return upload;
        });
        popup.setData({
            data: { uploads: uploads, data: [] },
        });
    });
    popup.on('uploads', (data) => {
        addTables(data.uploads);
        Entry.creationChangedEvent?.notify();
    });
    popup.on('draw', (data) => {
        Entry.playground.dataTable.addSources([
            {
                name: '테이블',
                fields: new Array(10).fill(''),
                data: new Array(29).fill(new Array(10).fill('')),
            },
        ]);
        Entry.creationChangedEvent.notify();
    });
    popup.on('uploadFail', uploadFail);
    popup.on('fail', failAlert);
    popup.on('error', failAlert);
}
