import fs from 'fs'
import multer from 'multer';
import {uid} from 'uid';
import Puid from 'puid';
import path from 'path';

const puid = new Puid();
const BASE_PATH = 'uploads';
const CK_BASE_PATH = 'uploadsCk';
const WS_BASE_PATH = 'uploadsWs';

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
const getStorage = (basePath, dataType) => {
    return multer.diskStorage({
        destination: function (req, file, cb) {
            file.name = createFileId() + path.extname(file.originalname);
            const firstDir = file.name.slice(0,2);
            const secondDir = file.name.slice(2,4);
            const dir = path.join(basePath, firstDir, secondDir, dataType);

            dirInit(dir);
            cb(null, dir);
        },
        filename: function (req, file, cb) {
            cb(null, file.name);
        }
    });
}

function createMulter(basePath, dataType, allowExtensions) {
    return multer({
        storage     : getStorage(basePath, dataType),
        fileFilter  : getFilter(allowExtensions),
        limits: {
            fileSize: 10000000,
        },
    });
}

// none mulipart data type
function Base64ImageUploader(basePath) {
    return (req, res, next) => {
        const {image, file} = req.body;
        req.file = {}

        const baseName = createFileId();
    
        const filename = `${baseName}.png`;
        const firstDir = filename.slice(0,2);
        const secondDir = filename.slice(2,4);
        const dirPath = path.join(basePath, firstDir, secondDir, 'image');
        dirInit(dirPath);
    
        const base64Data = image.replace(/^data:image\/png;base64,/, '');
        const filePath = path.join(dirPath, filename);
        req.file.path = filePath;

        const {ext, svg} = file;
        if (ext === 'svg') {
            const svgFilename = `${baseName}.svg`;
            const svgFilePath = path.join(dirPath, svgFilename);
            req.file.path = svgFilePath;
            
            fs.writeFileSync(svgFilePath, svg, (err) => {
                if (err) console.log(err);
            });
        }
        fs.writeFileSync(filePath, base64Data, 'base64', (err) => {
            if (err) console.log(err);
        });
    
        Object.assign(req.file, {
            fieldname: 'image',
            originalname: `${file.name}.${ext}`,
            encoding: 'base64',
            name: baseName,
            filename: baseName,
            destination: dirPath,
        });
        
        next();
    }
}

const upload = {
    images: createMulter(BASE_PATH, 'image', ['.jpg','.png','.bmp','.svg','.eo']).any(),
    tables: createMulter(BASE_PATH, 'table', ['.csv', '.xls', '.xlsx']).any(),
    sounds: createMulter(BASE_PATH, 'sound', ['.mp3', '.wav']).any(),
    base64Image: Base64ImageUploader(BASE_PATH),

    imagesWs: createMulter(WS_BASE_PATH, 'image', ['.jpg','.png','.bmp','.svg','.eo']).any(),
    tablesWs: createMulter(WS_BASE_PATH, 'table', ['.csv', '.xls', '.xlsx']).any(),
    soundsWs: createMulter(WS_BASE_PATH, 'sound', ['.mp3', '.wav']).any(),
    base64ImageWs: Base64ImageUploader(WS_BASE_PATH),

    onMemories: multer({storage: multer.memoryStorage(), limits: {fileSize: 50000000}}).any(),
    ckImages: createMulter(CK_BASE_PATH, 'image', ['.pjp','.jpg','.pjpeg','.jfif','.png','.gif','.bmp','.webp','.tif','.tiff']).any(),
}

export default upload;