import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const dirInit = (dir) => fs.mkdirSync(dir, { recursive: true });

export default class ThumbCreator{
    constructor(width, storage) {
        this.width = width;
        this.storage = storage;

        this.create = this.create.bind(this)
        this.createThumb = this.createThumb.bind(this)
    }
    
    create(req, res, next) {
        const savePromises = []
        if (typeof req.file !== 'undefined') {
            savePromises.push(this.createThumb(req.file));
        }
        else if (typeof req.files !== 'undefined') {
            for (let file of req.files) {
                savePromises.push(this.createThumb(file));
            }
        }
        Promise.all(savePromises).then(() => {next()});
    }

    createThumb(file) {
        const originalname = file.originalname;
        const filepath = file.path;
        const ext = path.extname(originalname).toLowerCase();
        const dir = (typeof this.storage === 'function') 
            ? this.storage(file) 
            : this.storage;
        dirInit(dir);

        const outExt = ext === '.svg' ? '.png':ext;
        const outfilename = path.basename(file.name, ext) + outExt;
        const outPath = path.join(dir, outfilename);

        console.log()
        file.thumbPath = `/${outPath}`;
        const thumb = (ext === '.svg') ? sharp(filepath).toFormat('png'):sharp(filepath);
        return thumb.resize(this.width).toFile(outPath);
    }
}
