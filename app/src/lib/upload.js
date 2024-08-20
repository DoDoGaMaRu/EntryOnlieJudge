import fs from 'fs'
import multer from 'multer';
import {uid} from 'uid';
import Puid from 'puid';
import path from 'path';

const puid = new Puid();
const BASE_PATH = 'uploads';

// util function
const dirInit = (dir) => fs.mkdirSync(dir, { recursive: true });
const createFileId = () => uid(8) + puid.generate();

// multipart data type
const getFilter = (allowedExtensions) => {
    return (req, file, cb) => {
        const fileExtension = path.extname(file.originalname).toLowerCase();

        if (allowedExtensions.includes(fileExtension)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PNG files are allowed.'), false);
        }
    }
}
const getStorage = (dataType) => {
    return multer.diskStorage({
        destination: function (req, file, cb) {
            file.name = createFileId() + path.extname(file.originalname);
            const firstDir = file.name.slice(0,2);
            const secondDir = file.name.slice(2,4);
            const dir = path.join(BASE_PATH, firstDir, secondDir, dataType);

            dirInit(dir);
            cb(null, dir);
        },
        filename: function (req, file, cb) {
            cb(null, file.name);
        }
    });
}

function createMulter(dataType, allowExtensions) {
    return multer({
        storage     : getStorage(dataType),
        fileFilter  : getFilter(allowExtensions),
        limits: {
            fileSize: 10000000,
        },
    });
}

// none mulipart data type
function base64Image(req, res, next) {
    const {image, file} = req.body;

    const filename = `${createFileId()}.png`;

    const firstDir = filename.slice(0,2);
    const secondDir = filename.slice(2,4);
    const dirPath = path.join(BASE_PATH, firstDir, secondDir, 'image');
    dirInit(dirPath);

    const base64Data = image.replace(/^data:image\/png;base64,/, '');
    const filePath = path.join(dirPath, filename);

    fs.writeFileSync(filePath, base64Data, 'base64', (err) => {
        if (err) console.log(err);
    });

    req.file = {
        fieldname: 'image',
        originalname: file.name,
        encoding: 'base64',
        name: filename,
        destination: dirPath,
        filename: filename,
        path: filePath
    };
    
    next();
}


const upload = {
    images: createMulter('image', ['.jpg','.png','.bmp','.svg','.eo']).any(),
    tables: createMulter('table', ['.csv', '.xls', '.xlsx']).any(),
    sounds: createMulter('sound', ['.mp3']).any(),
    base64Image: base64Image,
}

export default upload;