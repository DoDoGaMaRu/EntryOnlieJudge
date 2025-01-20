import fs from 'fs';
import XLSX from 'xlsx';

import AssetMetaLoader from '#utils/assetMetaLoader.js';

const aml = new AssetMetaLoader();
aml.caching('table');

const removeFileExt = filename => filename.replace(/\.[^/.]+$/, "");
const readTableSync = filePath => {
    const extension = filePath.split('.').pop().toLowerCase();
    let result = []

    if (extension === 'csv') {
        const csvData = fs.readFileSync(filePath, 'utf-8');
        const lines = csvData.split('\n').map(line => line.replace(/[\r\n]/g, '').split(','));

        const nonEmptyRows = lines.filter(row => row.some(cell => cell.trim() !== ''));
        if (nonEmptyRows.length) {
            const transposed = nonEmptyRows[0].map((_, colIndex) => nonEmptyRows.map(row => row[colIndex]));
            const nonEmptyColumns = transposed.filter(col => col.some(cell => cell.trim() !== ''));
            result = nonEmptyColumns[0].map((_, colIndex) => nonEmptyColumns.map(row => row[colIndex]));
        }
    } else if (extension === 'xls' || extension === 'xlsx') {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: '' });

        const nonEmptyRows = worksheet.filter(row => row.some(cell => cell !== undefined && cell !== ''));
        if (nonEmptyRows.length) {
            const transposed = nonEmptyRows[0].map((_, colIndex) => nonEmptyRows.map(row => row[colIndex]));
            const nonEmptyColumns = transposed.filter(col => col.some(cell => cell !== undefined && cell !== ''));
            result = nonEmptyColumns[0].map((_, colIndex) => nonEmptyColumns.map(row => row[colIndex]));
        }
    } else {
        throw new Error('Unsupported file format');
    }
    return result;
}
const toTable = (file) => {
    const tableData = readTableSync(file.path);
    file.path = `/${file.path}`
    
    return {
        filename: removeFileExt(file.name),
        name: file.originalname,
        rows: tableData.length ?? tableData.length-1,
        fields: tableData.length ? tableData[0]:[],
        projectTable: {
            name: file.originalname,
            fields: tableData.length ? tableData[0]:[],
            data: tableData.length ? tableData.slice(1):[],
        }
    }
}



// API handlers
export function getTable(req, res) {
    res.send(aml.get('table'));
}

export function getTableBySearchTerm(req, res) {
    const query = req.query.query;

    if (!query) {
        return res.status(400).send('Query parameter is required');
    }

    const filteredTables = aml.get('table').filter(({ name }) => {
        return name.includes(query);
    });

    res.send(filteredTables);
}

export function uploadTable(_req, res) {
    const tables = _req.files.map(toTable)
    res.send({
        uploads: tables,
    })
}
